'use server';

import clientPromise from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';
import type { Teacher } from '@/lib/types';
import { z } from 'zod';
import { createUser } from './users';

async function getDb() {
  const client = await clientPromise;
  return client.db('school');
}

const teacherSchema = z.object({
  fullName: z.string().min(1, 'El nombre completo es obligatorio.'),
  email: z.string().email('Correo electrónico inválido.'),
  phone: z.string().min(1, 'El teléfono es obligatorio.'),
  specialization: z.string().min(1, 'La especialización es obligatoria.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});

export async function createTeacher(data: unknown): Promise<{ success: boolean; error?: string | z.ZodError }> {
  const validation = teacherSchema.safeParse(data);

  if (!validation.success) {
    return { success: false, error: validation.error };
  }

  const { fullName, email, password, phone, specialization } = validation.data;

  try {
    const db = await getDb();
    
    // First, create the user account
    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('role', 'teacher');

    const userResult = await createUser(undefined, formData);

    if (userResult?.error) {
        // We need to handle the case where the user might already exist
        if (userResult.error.email) {
             return { success: false, error: 'Un usuario con este correo electrónico ya existe.' };
        }
       return { success: false, error: 'No se pudo crear la cuenta de usuario para el docente.' };
    }

    // If user is created successfully, create the teacher profile
    const newTeacher: Omit<Teacher, '_id'> = {
      id: crypto.randomUUID(),
      fullName,
      email,
      phone,
      specialization,
    };

    await db.collection('teachers').insertOne(newTeacher);
    revalidatePath('/admin/teachers');
    return { success: true };
  } catch (error) {
    console.error('Error creating teacher:', error);
    return { success: false, error: 'No se pudo crear el docente.' };
  }
}

export async function getTeachers(): Promise<Teacher[]> {
    try {
        const db = await getDb();
        const teachers = await db.collection('teachers').find({}).toArray();
        return JSON.parse(JSON.stringify(teachers));
    } catch (error) {
        console.error('Error fetching teachers:', error);
        return [];
    }
}

const updateTeacherSchema = z.object({
    fullName: z.string().min(1, 'El nombre completo es obligatorio.'),
    email: z.string().email('Correo electrónico inválido.'),
    phone: z.string().min(1, 'El teléfono es obligatorio.'),
    specialization: z.string().min(1, 'La especialización es obligatoria.'),
});

export async function updateTeacher(teacherId: string, data: unknown): Promise<{ success: boolean; error?: string | z.ZodError }> {
    const validation = updateTeacherSchema.safeParse(data);

    if (!validation.success) {
        return { success: false, error: validation.error };
    }
    
    try {
        const db = await getDb();
        await db.collection('teachers').updateOne({ id: teacherId }, { $set: validation.data });
        revalidatePath('/admin/teachers');
        return { success: true };
    } catch (error) {
        console.error('Error updating teacher:', error);
        return { success: false, error: 'No se pudo actualizar el docente.' };
    }
}

export async function deleteTeacher(teacherId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const db = await getDb();
        
        const teacher = await db.collection('teachers').findOne({ id: teacherId });
        if (!teacher) {
            return { success: false, error: 'Docente no encontrado.' };
        }

        // Delete the teacher profile
        await db.collection('teachers').deleteOne({ id: teacherId });
        
        // Delete the associated user account
        await db.collection('users').deleteOne({ email: teacher.email });
        
        revalidatePath('/admin/teachers');
        return { success: true };
    } catch (error) {
        console.error('Error deleting teacher:', error);
        return { success: false, error: 'No se pudo eliminar el docente.' };
    }
}