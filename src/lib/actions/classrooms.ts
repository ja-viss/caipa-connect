'use server';

/**
 * @fileoverview Server actions for managing classrooms.
 * Includes functions for creating, retrieving, updating, and deleting classrooms and their schedules.
 */

import clientPromise from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { Classroom, ScheduleEntry } from '../types';

/**
 * Retrieves the 'school' database instance.
 * @returns {Promise<Db>} The database instance.
 */
async function getDb() {
  const client = await clientPromise;
  return client.db('school');
}

// Schema for validating a single schedule entry.
const scheduleEntrySchema = z.object({
  day: z.string().min(1, 'El día es obligatorio.'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora de inicio inválido (HH:MM).'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora de fin inválido (HH:MM).'),
  areaId: z.string().min(1, 'Debe seleccionar un área.'),
});

// Schema for validating classroom data, including an array of schedule entries.
const classroomSchema = z.object({
  name: z.string().min(1, 'El nombre/número del aula es obligatorio.'),
  building: z.string().min(1, 'El edificio es obligatorio.'),
  schedule: z.array(scheduleEntrySchema).optional(),
});

/**
 * Creates a new classroom in the database.
 * @param prevState - The previous state of the form.
 * @param formData - The data from the form submission.
 * @returns An object indicating success or failure with errors.
 */
export async function createClassroom(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const building = formData.get('building') as string;
  
  const scheduleData = formData.get('schedule');
  const schedule = scheduleData ? JSON.parse(scheduleData as string) : [];

  const validatedFields = classroomSchema.safeParse({ name, building, schedule });
  
  if (!validatedFields.success) {
    return { success: false, error: validatedFields.error.flatten().fieldErrors };
  }

  try {
    const db = await getDb();
    const newClassroom: Omit<Classroom, '_id'> = {
      id: crypto.randomUUID(),
      ...validatedFields.data,
      schedule: validatedFields.data.schedule?.map(s => ({...s, id: crypto.randomUUID()})) || [],
    };
    await db.collection('classrooms').insertOne(newClassroom);
    revalidatePath('/admin/classrooms');
    return { success: true };
  } catch (error) {
    console.error('Error creating classroom:', error);
    return { success: false, error: { form: ['No se pudo crear el aula.'] } };
  }
}

/**
 * Retrieves all classrooms from the database.
 * @returns {Promise<Classroom[]>} A promise that resolves to an array of classrooms.
 */
export async function getClassrooms(): Promise<Classroom[]> {
  try {
    const db = await getDb();
    const classrooms = await db.collection('classrooms').find({}).toArray();
    return JSON.parse(JSON.stringify(classrooms));
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    return [];
  }
}

/**
 * Updates an existing classroom in the database.
 * @param classroomId - The ID of the classroom to update.
 * @param prevState - The previous state of the form.
 * @param formData - The data from the form submission.
 * @returns An object indicating success or failure with errors.
 */
export async function updateClassroom(classroomId: string, prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const building = formData.get('building') as string;

  const scheduleData = formData.get('schedule');
  const schedule = scheduleData ? JSON.parse(scheduleData as string) : [];
  
  const validatedFields = classroomSchema.safeParse({ name, building, schedule });
  
  if (!validatedFields.success) {
    return { success: false, error: validatedFields.error.flatten().fieldErrors };
  }

  try {
    const db = await getDb();
    // Ensure schedule entries have unique IDs, preserving existing ones.
    const scheduleWithIds = validatedFields.data.schedule?.map(s => ({...s, id: s.id || crypto.randomUUID()})) || [];

    await db.collection('classrooms').updateOne(
        { id: classroomId }, 
        { $set: { ...validatedFields.data, schedule: scheduleWithIds } }
    );
    revalidatePath('/admin/classrooms');
    return { success: true };
  } catch (error) {
    console.error('Error updating classroom:', error);
    return { success: false, error: { form: ['No se pudo actualizar el aula.'] } };
  }
}

/**
 * Deletes a classroom from the database.
 * @param classroomId - The ID of the classroom to delete.
 * @returns An object indicating success or failure.
 */
export async function deleteClassroom(classroomId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDb();
    await db.collection('classrooms').deleteOne({ id: classroomId });
    revalidatePath('/admin/classrooms');
    return { success: true };
  } catch (error) {
    console.error('Error deleting classroom:', error);
    return { success: false, error: 'No se pudo eliminar el aula.' };
  }
}
