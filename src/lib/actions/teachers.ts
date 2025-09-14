'use server';

import clientPromise from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';
import type { Teacher, Student, Area, Classroom } from '@/lib/types';
import { z } from 'zod';
import { createUser, getSession } from './users';
import { redirect } from 'next/navigation';


async function getDb() {
  const client = await clientPromise;
  return client.db('school');
}

const teacherSchema = z.object({
  fullName: z.string().min(1, 'El nombre completo es obligatorio.'),
  ci: z.string().min(1, 'La cédula de identidad es obligatoria.'),
  email: z.string().email('Correo electrónico inválido.'),
  phone: z.string().min(1, 'El teléfono es obligatorio.'),
  specialization: z.string().min(1, 'La especialización es obligatoria.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});

export async function createTeacher(prevState: any, formData: FormData): Promise<{ success: boolean; error?: any }> {
  const validatedFields = teacherSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return { success: false, error: validatedFields.error.flatten().fieldErrors };
  }

  const { fullName, email, password, phone, specialization, ci } = validatedFields.data;

  try {
    const db = await getDb();
    
    // First, create the user account for the teacher.
    const userFormData = new FormData();
    userFormData.append('fullName', fullName);
    userFormData.append('email', email);
    userFormData.append('password', password);
    userFormData.append('role', 'teacher');

    const userResult = await createUser(undefined, userFormData);

    if (userResult?.error || !userResult?.userId) {
        // Forward the specific error from createUser
        return { success: false, error: userResult?.error || { form: ['No se pudo crear la cuenta de usuario.'] } };
    }
    
    const teacherId = crypto.randomUUID();

    // If user is created successfully, create the teacher profile
    const newTeacher: Omit<Teacher, '_id'> = {
      id: teacherId,
      fullName,
      ci,
      email,
      phone,
      specialization,
    };

    await db.collection('teachers').insertOne(newTeacher);

    // Link the teacherId to the user account
    await db.collection('users').updateOne(
        { id: userResult.userId },
        { $set: { teacherId: teacherId } }
    );
  
  } catch (error) {
    console.error('Error creating teacher:', error);
    return { success: false, error: { form: ['No se pudo crear el docente.'] }};
  }
  
  revalidatePath('/admin/teachers');
  return { success: true };
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
    ci: z.string().min(1, 'La cédula de identidad es obligatoria.'),
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

export async function getTeacherData() {
  const session = await getSession();
  if (!session?.user || session.user.role !== 'teacher' || !session.user.teacherId) {
    return null;
  }

  const teacherId = session.user.teacherId;

  try {
    const db = await getDb();
    const teacher = await db.collection('teachers').findOne({ id: teacherId });
    if (!teacher) {
        return null;
    }

    const assignedAreas = await db.collection('areas').find({ teacherIds: teacherId }).toArray();
    const assignedAreaIds = assignedAreas.map(a => a.id);

    // Get all student IDs from the teacher's assigned areas
    const allStudentIdsInAreas = assignedAreas.flatMap(area => area.studentIds || []);
    const uniqueStudentIds = [...new Set(allStudentIdsInAreas)];
    
    // Fetch all students whose IDs are in the list
    const assignedStudents = await db.collection('students').find({
      id: { $in: uniqueStudentIds }
    }).toArray();
    
     const assignedClassrooms = await db.collection('classrooms').find({
      'schedule.areaId': { $in: assignedAreaIds }
    }).toArray();


    return {
      teacher: JSON.parse(JSON.stringify(teacher)) as Teacher,
      assignedAreas: JSON.parse(JSON.stringify(assignedAreas)) as Area[],
      assignedClassrooms: JSON.parse(JSON.stringify(assignedClassrooms)) as Classroom[],
      assignedStudents: JSON.parse(JSON.stringify(assignedStudents)) as Student[],
    };
  } catch (error) {
    console.error('Error fetching teacher data:', error);
    return null;
  }
}
