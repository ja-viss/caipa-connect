
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import clientPromise from '@/lib/mongodb';
import type { User, Teacher } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

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

const secretKey = process.env.SESSION_SECRET || 'fallback-secret-for-jwt-very-long-and-secure';
const key = new TextEncoder().encode(secretKey);

async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h') // Las sesiones expiran en 1 hora
    .sign(key);
}

async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (e) {
    // Si el token es inválido o ha expirado, retorna null
    return null;
  }
}

export async function getSession() {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) return null;
  const session = await decrypt(sessionCookie);
  if (!session) return null;

  // Refrescar la sesión si está por expirar (opcional, pero buena práctica)
  const expires = new Date(session.expires);
  const now = new Date();
  const halfHour = 30 * 60 * 1000;
  if (expires.getTime() - now.getTime() < halfHour) {
     await createSession(session.user);
  }

  return session;
}


async function createSession(user: Omit<User, 'password' | '_id'>) {
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora desde ahora
    const sessionPayload = { user, expires };
    const session = await encrypt(sessionPayload);
    cookies().set('session', session, { expires, httpOnly: true, secure: process.env.NODE_ENV === 'production' });
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
  let user: Omit<User, 'password' | '_id'> | null = null;

  try {
    const db = await getDb();
    const foundUser = await db.collection('users').findOne({ email });

    if (!foundUser) {
      return {
        error: { form: ['El correo electrónico o la contraseña son incorrectos.'] },
      };
    }
    
    // IMPORTANTE: En una aplicación real, NUNCA almacenes contraseñas en texto plano.
    // Usa una librería como `bcrypt` para hashear y comparar contraseñas.
    // Ejemplo: const passwordMatch = await bcrypt.compare(password, foundUser.password);
    if (foundUser.password !== password) {
         return {
            error: { form: ['El correo electrónico o la contraseña son incorrectos.'] },
        };
    }
    
    // Role-specific profile validation
    if (foundUser.role === 'teacher') {
      const teacherProfile = await db.collection('teachers').findOne({ email: foundUser.email });
      if (!teacherProfile) {
        return { error: { form: ['No se encontró un perfil de docente para este usuario.'] } };
      }
      foundUser.teacherId = teacherProfile.id;
    } else if (foundUser.role === 'representative') {
      const studentProfile = await db.collection('students').findOne({ 'representative.email': foundUser.email });
      if (!studentProfile) {
        return { error: { form: ['No se encontró un estudiante asociado a este representante.'] } };
      }
    }

    user = {
        id: foundUser.id,
        fullName: foundUser.fullName,
        email: foundUser.email,
        role: foundUser.role,
        teacherId: foundUser.teacherId,
        securityQuestions: foundUser.securityQuestions,
    };

  } catch (error) {
    console.error("Error durante el inicio de sesión:", error);
    return {
      error: { form: ['Ocurrió un error en el servidor. Inténtalo de nuevo.'] },
    };
  }

  if (user) {
    await createSession(user);
    
    let redirectTo = '/dashboard';
    switch(user.role) {
        case 'representative':
            redirectTo = '/representative/dashboard';
            break;
        case 'teacher':
            redirectTo = '/teacher/dashboard';
            break;
    }
    return { success: true, redirectTo };
  }
  return { error: { form: ['Error desconocido.'] } };
}


export async function logoutUser() {
  cookies().delete('session');
  redirect('/login');
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

        // IMPORTANTE: En una aplicación real, hashea la contraseña antes de guardarla.
        // const hashedPassword = await bcrypt.hash(password, 10);
        const newUser: Omit<User, '_id'> = {
            id: crypto.randomUUID(),
            fullName,
            email,
            password, // Debería ser hashedPassword
            role,
        };

        await db.collection('users').insertOne(newUser);
        
        revalidatePath('/admin/users');
        return { success: true, userId: newUser.id };

    } catch (error) {
        console.error("Error creando usuario:", error);
        return {
            error: { form: ['Ocurrió un error en el servidor. Inténtalo de nuevo.'] },
        };
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

const userProfileSchema = z.object({
  fullName: z.string().min(1, 'El nombre completo es obligatorio.'),
  password: z.string().optional().refine(val => !val || val.length >= 6, {
    message: 'La nueva contraseña debe tener al menos 6 caracteres.',
  }),
  avatarUrl: z.union([z.string().url('URL de imagen inválida.'), z.literal('')]).optional(),
});


export async function updateUserProfile(data: unknown): Promise<{ success: boolean; error?: string | z.ZodError }> {
    const session = await getSession();
    if (!session?.user) {
        return { success: false, error: 'No autorizado.' };
    }

    const validation = userProfileSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: validation.error };
    }

    const { fullName, password, avatarUrl } = validation.data;
    
    try {
        const db = await getDb();
        const updateData: { fullName: string; password?: string; avatarUrl?: string } = { fullName, avatarUrl };
        if (password) {
            // IMPORTANTE: Hashear contraseña en una app real
            updateData.password = password;
        }
        
        await db.collection('users').updateOne({ id: session.user.id }, { $set: updateData });

        if (session.user.role === 'teacher') {
            await db.collection('teachers').updateOne({ id: session.user.teacherId }, { $set: { fullName, avatarUrl } });
        } else if (session.user.role === 'representative') {
            await db.collection('students').updateOne({ 'representative.email': session.user.email }, { $set: { 'representative.name': fullName } });
        }

        revalidatePath('/settings');
        // Actualizar la sesión con el nuevo nombre
        const updatedUser = { ...session.user, fullName, avatarUrl };
        await createSession(updatedUser);

        return { success: true };
    } catch (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: 'No se pudo actualizar el perfil.' };
    }
}

const securityQuestionsSchema = z.object({
  question1: z.string().min(1),
  answer1: z.string().min(1),
  question2: z.string().min(1),
  answer2: z.string().min(1),
});

export async function saveSecurityQuestions(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session?.user) return { success: false, error: 'No autorizado.' };

    const validatedFields = securityQuestionsSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { success: false, error: 'Por favor, completa todas las preguntas y respuestas.' };
    }

    const { question1, answer1, question2, answer2 } = validatedFields.data;
    const questions = [
        { question: question1, answer: answer1.toLowerCase().trim() },
        { question: question2, answer: answer2.toLowerCase().trim() },
    ];

    try {
        const db = await getDb();
        await db.collection('users').updateOne({ id: session.user.id }, { $set: { securityQuestions: questions } });
        
        // Update session
        const updatedUser = { ...session.user, securityQuestions: questions };
        await createSession(updatedUser);
        
        revalidatePath('/settings');
        return { success: true, message: 'Preguntas de seguridad guardadas exitosamente.' };
    } catch (e) {
        return { success: false, error: 'No se pudieron guardar las preguntas.' };
    }
}


export async function requestPasswordReset(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    if (!email) return { error: 'El correo es obligatorio.' };
    
    try {
        const db = await getDb();
        const user = await db.collection('users').findOne({ email });

        if (!user) return { error: 'No se encontró un usuario con ese correo.' };
        if (!user.securityQuestions || user.securityQuestions.length === 0) {
            return { error: 'Este usuario no tiene preguntas de seguridad configuradas.' };
        }
        
        const randomIndex = Math.floor(Math.random() * user.securityQuestions.length);
        const randomQuestion = user.securityQuestions[randomIndex];

        return {
            success: true,
            email,
            question: randomQuestion.question,
        };
    } catch (e) {
        return { error: 'Ocurrió un error en el servidor.' };
    }
}

export async function verifySecurityAnswer(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const question = formData.get('question') as string;
    const answer = (formData.get('answer') as string || '').toLowerCase().trim();

    if (!email || !question || !answer) return { ...prevState, error: 'Todos los campos son obligatorios.' };

    try {
        const db = await getDb();
        const user = await db.collection('users').findOne({ email, 'securityQuestions.question': question });
        
        if (!user) return { ...prevState, error: 'Error de verificación. Inténtalo de nuevo.' };
        
        const storedQuestion = user.securityQuestions.find((q: any) => q.question === question);
        if (storedQuestion.answer !== answer) {
            return { ...prevState, error: 'La respuesta es incorrecta.' };
        }

        return { success: true, email };
    } catch (e) {
        return { ...prevState, error: 'Ocurrió un error en el servidor.' };
    }
}

export async function resetPassword(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!password || password.length < 6) {
        return { ...prevState, error: 'La contraseña debe tener al menos 6 caracteres.' };
    }
    if (!email) {
        return { ...prevState, error: 'La sesión de reseteo ha expirado. Por favor, inténtalo de nuevo.' };
    }

    try {
        const db = await getDb();
        // Hash password here in a real app
        await db.collection('users').updateOne({ email }, { $set: { password: password } });
        return { success: true };
    } catch (e) {
        return { ...prevState, error: 'No se pudo actualizar la contraseña.' };
    }
}


export async function deleteUser(userId: string, userRole: User['role'], userEmail: string): Promise<{ success: boolean; error?: string }> {
    try {
        const db = await getDb();
        
        const result = await db.collection('users').deleteOne({ id: userId });
        if (result.deletedCount === 0) {
            return { success: false, error: 'Usuario no encontrado.' };
        }

        if (userRole === 'teacher') {
            await db.collection('teachers').deleteOne({ email: userEmail });
            revalidatePath('/admin/teachers');
        }

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
