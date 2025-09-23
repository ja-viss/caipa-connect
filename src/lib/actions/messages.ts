'use server';

/**
 * @fileoverview Server actions for the messaging system.
 * Includes functions for sending, retrieving, updating, and deleting messages.
 */

import clientPromise from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { Message, User } from '../types';
import { getSession } from './users';
import { cookies } from 'next/headers';

/**
 * Retrieves the 'school' database instance.
 * @returns {Promise<Db>} The database instance.
 */
async function getDb() {
  const client = await clientPromise;
  return client.db('school');
}

// Schema for validating new message data.
const messageSchema = z.object({
  recipientType: z.enum(['all-teachers', 'all-reps', 'teacher', 'rep']),
  recipientId: z.string().optional(),
  subject: z.string().min(1, 'El asunto es obligatorio.'),
  body: z.string().min(1, 'El cuerpo del mensaje es obligatorio.'),
});

/**
 * Sends a new message and saves it to the database.
 * @param prevState - The previous state of the form.
 * @param formData - The data from the form submission.
 * @returns An object indicating success or failure with errors.
 */
export async function sendMessage(prevState: any, formData: FormData) {
  const validatedFields = messageSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return { success: false, error: validatedFields.error.flatten().fieldErrors };
  }
  
  const { recipientType, recipientId, subject, body } = validatedFields.data;

  if ((recipientType === 'teacher' || recipientType === 'rep') && !recipientId) {
      return { success: false, error: { form: ['Debe seleccionar un destinatario específico.'] } };
  }

  try {
    const db = await getDb();
    const newMessage: Omit<Message, '_id'> = {
      id: crypto.randomUUID(),
      senderId: 'admin', // In a real app, this would be the logged-in user's ID
      recipient: {
        type: recipientType,
        id: recipientId,
      },
      subject,
      body,
      timestamp: new Date().toISOString(),
      readBy: [],
    };

    await db.collection('messages').insertOne(newMessage);
    revalidatePath('/messages');
    revalidatePath('/representative/messages');
    return { success: true };

  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, error: { form: ['No se pudo enviar el mensaje.'] } };
  }
}

/**
 * Retrieves messages based on the user's role.
 * Admins get all messages, teachers get messages sent to them or all teachers.
 * @param user - The current user object.
 * @returns {Promise<Message[]>} A promise that resolves to an array of messages.
 */
export async function getMessages(user: User): Promise<Message[]> {
  try {
    const db = await getDb();
    let query = {};
    
    if (user.role === 'teacher') {
        query = {
            $or: [
                { 'recipient.type': 'all-teachers' },
                { 'recipient.type': 'teacher', 'recipient.id': user.teacherId }
            ]
        };
    }
    // Admins will have an empty query, fetching all messages.

    const messages = await db.collection('messages').find(query).sort({ timestamp: -1 }).toArray();
    return JSON.parse(JSON.stringify(messages));
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

/**
 * Retrieves messages for a specific representative and marks them as read.
 * @param repEmail - The email address of the representative.
 * @returns {Promise<Message[]>} A promise that resolves to an array of messages.
 */
export async function getMessagesForRepresentative(repEmail: string): Promise<Message[]> {
    try {
        const db = await getDb();
        const messages = await db.collection('messages').find({
            $or: [
                { 'recipient.type': 'all-reps' },
                { 'recipient.type': 'rep', 'recipient.id': repEmail }
            ]
        }).sort({ timestamp: -1 }).toArray();
        
        // Mark messages as read for this user
        const messageIds = messages.map(m => m.id);
        await db.collection('messages').updateMany(
            { id: { $in: messageIds }, readBy: { $ne: repEmail } },
            { $addToSet: { readBy: repEmail } }
        );

        return JSON.parse(JSON.stringify(messages));
    } catch (error) {
        console.error('Error fetching messages for representative:', error);
        return [];
    }
}

/**
 * Counts the number of unread messages for the currently logged-in representative.
 * @returns {Promise<number>} A promise that resolves to the count of unread messages.
 */
export async function getUnreadMessagesCount(): Promise<number> {
    const session = await getSession();
    if (!session?.user?.email || session.user.role !== 'representative') {
        return 0;
    }
    const repEmail = session.user.email;

    try {
        const db = await getDb();
        const count = await db.collection('messages').countDocuments({
            $or: [
                { 'recipient.type': 'all-reps' },
                { 'recipient.type': 'rep', 'recipient.id': repEmail }
            ],
            readBy: { $ne: repEmail }
        });
        return count;
    } catch (error) {
        console.error('Error fetching unread messages count:', error);
        return 0;
    }
}

// Schema for validating message updates.
const updateMessageSchema = z.object({
  subject: z.string().min(1, 'El asunto es obligatorio.'),
  body: z.string().min(1, 'El cuerpo del mensaje es obligatorio.'),
});

/**
 * Updates an existing message and resets its read status for all recipients.
 * @param messageId - The ID of the message to update.
 * @param prevState - The previous state of the form.
 * @param formData - The data from the form submission.
 * @returns An object indicating success or failure.
 */
export async function updateMessage(messageId: string, prevState: any, formData: FormData) {
  const validatedFields = updateMessageSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return { success: false, error: validatedFields.error.flatten().fieldErrors };
  }
  
  try {
    const db = await getDb();
    await db.collection('messages').updateOne(
        { id: messageId },
        { $set: { subject: validatedFields.data.subject, body: validatedFields.data.body, readBy: [] } }
    );
    revalidatePath('/messages');
    revalidatePath('/representative/messages');
    return { success: true };
  } catch (error) {
    console.error('Error updating message:', error);
    return { success: false, error: { form: ['No se pudo actualizar el mensaje.'] }};
  }
}

/**
 * Deletes a message from the database.
 * @param messageId - The ID of the message to delete.
 * @returns An object indicating success or failure.
 */
export async function deleteMessage(messageId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDb();
    await db.collection('messages').deleteOne({ id: messageId });
    revalidatePath('/messages');
    revalidatePath('/representative/messages');
    return { success: true };
  } catch (error) {
    console.error('Error deleting message:', error);
    return { success: false, error: 'No se pudo eliminar el mensaje.' };
  }
}
