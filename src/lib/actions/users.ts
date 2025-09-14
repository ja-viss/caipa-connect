'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import clientPromise from '@/lib/mongodb';
import type { User } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido.'),
  password: z.string().min(1, 'La contraseña es obligatoria.'),
});

const registerSchema = z.object({
  fullName: z.string().min(1, 'El nombre completo es obligatorio.'),
  email: z.string().email('Correo electrónico inválido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
  role: z.enum(['admin', 'teacher', 'representative'], {
    errorMap: () => ({ message: 'Por favor, selecciona un rol válido.' }),
  }),
});

const updateUserSchema = z.object({
  fullName: z.string().min(1, 'El nombre completo es obligatorio.'),
  role: z.enum(['admin', 'teacher', 'representative'], {
    errorMap: () => ({ message: 'Por favor, selecciona un rol válido.' }),
  }),
});

async function getDb() {
  const client = await clientPromise;
  return client.db('school');
}

export async function loginUser(prevState: any, formData: FormData) {
  const validatedFields = loginSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;
  let userRole: User['role'] | undefined;

  try {
    const db = await getDb();
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return {
        error: { form: ['El correo electrónico o la contraseña son incorrectos.'] },
      };
    }
    
    // In a real app, you should hash passwords and compare them securely.
    // For this demo, we'll do a simple string comparison.
    if (user.password !== password) {
         return {
            error: { form: ['El correo electrónico o la contraseña son incorrectos.'] },
        };
    }
    
    userRole = user.role;

  } catch (error) {
    console.error(error);
    return {
      error: { form: ['Ocurrió un error en el servidor. Inténtalo de nuevo.'] },
    };
  }

  if (userRole === 'representative') {
      redirect('/representative/dashboard');
  } else {
      redirect('/dashboard');
  }
}


export async function createUser(prevState: any, formData: FormData) {
    const validatedFields = registerSchema.safeParse(
        Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
        return {
            error: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { fullName, email, password, role } = validatedFields.data;

    try {
        const db = await getDb();
        const existingUser = await db.collection('users').findOne({ email });

        if (existingUser) {
            return {
                error: { email: ['Un usuario con este correo electrónico ya existe.'] },
            };
        }

        const newUser: Omit<User, '_id'> = {
            id: crypto.randomUUID(),
            fullName,
            email,
            password, // Again, hash this in a real app
            role,
        };

        await db.collection('users').insertOne(newUser);

    } catch (error) {
        console.error(error);
        return {
            error: { form: ['Ocurrió un error en el servidor. Inténtalo de nuevo.'] },
        };
    }
    
    // Only redirect if it's a new user registration, not a programmatic creation
    if (role !== 'teacher' && role !== 'representative') {
      redirect('/dashboard');
    }
}

export async function getUsers(): Promise<User[]> {
    try {
        const db = await getDb();
        const users = await db.collection('users').find({}).toArray();
        return JSON.parse(JSON.stringify(users));
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

export async function updateUser(userId: string, prevState: any, formData: FormData) {
    const validatedFields = updateUserSchema.safeParse(
        Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
        return { success: false, error: validatedFields.error.flatten().fieldErrors };
    }
    
    const { fullName, role } = validatedFields.data;

    try {
        const db = await getDb();
        const user = await db.collection('users').findOne({ id: userId });
        if (!user) {
            return { success: false, error: { form: ['Usuario no encontrado.'] } };
        }

        await db.collection('users').updateOne({ id: userId }, { $set: { fullName, role } });

        // If user is a representative, update their name in the associated student records.
        if (user.role === 'representative' || role === 'representative') {
             await db.collection('students').updateMany(
                { 'representative.email': user.email },
                { $set: { 'representative.name': fullName } }
            );
            revalidatePath('/students');
            revalidatePath('/students/[id]', 'layout');
        }


        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Error updating user:', error);
        return { success: false, error: { form: ['No se pudo actualizar el usuario.'] } };
    }
}


export async function deleteUser(userId: string, userRole: User['role'], userEmail: string): Promise<{ success: boolean; error?: string }> {
    try {
        const db = await getDb();
        
        // Delete the user
        const result = await db.collection('users').deleteOne({ id: userId });
        if (result.deletedCount === 0) {
            return { success: false, error: 'Usuario no encontrado.' };
        }

        // If the user was a teacher, delete their teacher profile
        if (userRole === 'teacher') {
            await db.collection('teachers').deleteOne({ email: userEmail });
            revalidatePath('/admin/teachers');
        }

        // If the user was a representative, find and delete associated students
        if (userRole === 'representative') {
            const students = await db.collection('students').find({ 'representative.email': userEmail }).toArray();
            if (students.length > 0) {
                const studentIds = students.map(s => s.id);
                await db.collection('students').deleteMany({ id: { $in: studentIds } });
                await db.collection('activityLogs').deleteMany({ studentId: { $in: studentIds } });
                await db.collection('progressReports').deleteMany({ studentId: { $in: studentIds } });
                revalidatePath('/students');
            }
        }
        
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Error deleting user:', error);
        return { success: false, error: 'No se pudo eliminar el usuario.' };
    }
}
