'use server';

import clientPromise from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { Area } from '../types';

async function getDb() {
  const client = await clientPromise;
  return client.db('school');
}

const areaSchema = z.object({
  name: z.string().min(1, 'El nombre del área es obligatorio.'),
  description: z.string().min(1, 'La descripción es obligatoria.'),
  teacherIds: z.array(z.string()).optional(),
  studentIds: z.array(z.string()).optional(),
});

export async function createArea(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const teacherIds = formData.getAll('teacherIds') as string[];
  const studentIds = formData.getAll('studentIds') as string[];

  const validatedFields = areaSchema.safeParse({ name, description, teacherIds, studentIds });
  
  if (!validatedFields.success) {
    return { success: false, error: validatedFields.error.flatten().fieldErrors };
  }

  try {
    const db = await getDb();
    const newArea: Omit<Area, '_id'> = {
      id: crypto.randomUUID(),
      ...validatedFields.data,
    };
    await db.collection('areas').insertOne(newArea);
    revalidatePath('/admin/areas');
    return { success: true };
  } catch (error) {
    console.error('Error creating area:', error);
    return { success: false, error: { form: ['No se pudo crear el área.'] } };
  }
}

export async function getAreas(): Promise<Area[]> {
  try {
    const db = await getDb();
    const areas = await db.collection('areas').find({}).toArray();
    return JSON.parse(JSON.stringify(areas));
  } catch (error) {
    console.error('Error fetching areas:', error);
    return [];
  }
}

export async function updateArea(areaId: string, prevState: any, formData: FormData) {
   const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const teacherIds = formData.getAll('teacherIds') as string[];
  const studentIds = formData.getAll('studentIds') as string[];

  const validatedFields = areaSchema.safeParse({ name, description, teacherIds, studentIds });
  
  if (!validatedFields.success) {
    return { success: false, error: validatedFields.error.flatten().fieldErrors };
  }

  try {
    const db = await getDb();
    await db.collection('areas').updateOne({ id: areaId }, { $set: validatedFields.data });
    revalidatePath('/admin/areas');
    return { success: true };
  } catch (error) {
    console.error('Error updating area:', error);
    return { success: false, error: { form: ['No se pudo actualizar el área.'] } };
  }
}

export async function deleteArea(areaId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDb();
    await db.collection('areas').deleteOne({ id: areaId });
    revalidatePath('/admin/areas');
    return { success: true };
  } catch (error) {
    console.error('Error deleting area:', error);
    return { success: false, error: 'No se pudo eliminar el área.' };
  }
}
