'use server';

import clientPromise from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { Message } from '../types';

async function getDb() {
  const client = await clientPromise;
  return client.db('school');
}

const messageSchema = z.object({
  recipientType: z.enum(['all-teachers', 'all-reps', 'teacher', 'rep']),
  recipientId: z.string().optional(),
  subject: z.string().min(1, 'El asunto es obligatorio.'),
  body: z.string().min(1, 'El cuerpo del mensaje es obligatorio.'),
});

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
    };

    await db.collection('messages').insertOne(newMessage);
    revalidatePath('/messages');
    return { success: true };

  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, error: { form: ['No se pudo enviar el mensaje.'] } };
  }
}


export async function getMessages(): Promise<Message[]> {
  try {
    const db = await getDb();
    const messages = await db.collection('messages').find({}).sort({ timestamp: -1 }).toArray();
    return JSON.parse(JSON.stringify(messages));
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}
