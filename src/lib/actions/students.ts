'use server';

import clientPromise from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';
import type { Student, ActivityLog, ProgressReport, Conversation, DashboardStats, Event, Resource } from '@/lib/types';
import { PlaceHolderImages } from '../placeholder-images';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { createUser } from './users';


async function getDb() {
  const client = await clientPromise;
  return client.db('school');
}

export async function getStudents(): Promise<Student[]> {
  try {
    const db = await getDb();
    const students = await db.collection('students').find({}).toArray();
    return JSON.parse(JSON.stringify(students));
  } catch (error) {
    console.error('Error fetching students:', error);
    return [];
  }
}

const studentSchema = z.object({
  // Student Info
  name: z.string().min(1, 'El nombre del estudiante es obligatorio.'),
  dob: z.string().min(1, 'La fecha de nacimiento es obligatoria.'),
  gender: z.string().min(1, 'El género es obligatorio.'),
  
  // Emergency Contact
  emergencyContactName: z.string().min(1, 'El nombre del contacto de emergencia es obligatorio.'),
  emergencyContactPhone: z.string().min(1, 'El teléfono del contacto de emergencia es obligatorio.'),
  emergencyContactRelation: z.string().min(1, 'La relación del contacto de emergencia es obligatoria.'),
  
  // Medical Info
  diagnosis: z.string().min(1, 'El diagnóstico es obligatorio.'),
  medicalConditions: z.string().min(1, 'Las condiciones médicas son obligatorias.'),
  medications: z.string().min(1, 'Los medicamentos son obligatorios.'),
  allergies: z.string().min(1, 'Las alergias son obligatorias.'),
  
  // Pedagogical Info
  gradeLevel: z.string().min(1, 'El nivel educativo es obligatorio.'),
  specializationArea: z.string().min(1, 'El área de especialización es obligatoria.'),
  skillsAndInterests: z.string().min(1, 'Las habilidades e intereses son obligatorios.'),
  supportNeeds: z.string().min(1, 'Las necesidades de apoyo son obligatorias.'),
  
  // Representative Info
  representativeName: z.string().min(1, 'El nombre del representante es obligatorio.'),
  representativeCi: z.string().regex(/^\d+$/, 'La cédula de identidad solo debe contener números.').min(1, 'La cédula de identidad es obligatoria.'),
  representativeRelation: z.string().min(1, 'La relación con el estudiante es obligatoria.'),
  representativePhone: z.string().min(1, 'El teléfono del representante es obligatorio.'),
  representativeEmail: z.string().email('Correo electrónico de representante inválido.'),
  representativeAddress: z.string().optional(),
  representativePassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});


export async function createStudent(data: unknown): Promise<{ success: boolean; error?: string | z.ZodError | { form?: string[], representativeEmail?: string[]} }> {
    const validation = studentSchema.safeParse(data);

    if (!validation.success) {
      return { success: false, error: validation.error };
    }
    
    const validatedData = validation.data;
    
    try {
        const db = await getDb();
        
        // Step 1: Create the representative's user account
        const userFormData = new FormData();
        userFormData.append('fullName', validatedData.representativeName);
        userFormData.append('email', validatedData.representativeEmail);
        userFormData.append('password', validatedData.representativePassword);
        userFormData.append('role', 'representative');

        const userResult = await createUser(undefined, userFormData);

        if (userResult?.error) {
            // Check if the error is for an existing email
            if (userResult.error.email) {
                 return { success: false, error: { representativeEmail: userResult.error.email } };
            }
            return { success: false, error: { form: ['No se pudo crear la cuenta de usuario del representante.'] } };
        }


        // Step 2: Create the student profile
        const newStudent: Omit<Student, '_id' | 'email' | 'learningObjectives'> = {
            id: crypto.randomUUID(),
            name: validatedData.name,
            dob: validatedData.dob,
            gender: validatedData.gender,
            emergencyContact: {
              name: validatedData.emergencyContactName,
              phone: validatedData.emergencyContactPhone,
              relation: validatedData.emergencyContactRelation,
            },
            medicalInfo: {
              diagnosis: validatedData.diagnosis,
              conditions: validatedData.medicalConditions,
              medications: validatedData.medications,
              allergies: validatedData.allergies,
            },
            pedagogicalInfo: {
              gradeLevel: validatedData.gradeLevel,
              specializationArea: validatedData.specializationArea,
              skillsAndInterests: validatedData.skillsAndInterests,
              supportNeeds: validatedData.supportNeeds,
            },
            representative: {
                name: validatedData.representativeName,
                ci: validatedData.representativeCi,
                relation: validatedData.representativeRelation,
                phone: validatedData.representativePhone,
                email: validatedData.representativeEmail,
                address: validatedData.representativeAddress,
            },
        };

        await db.collection('students').insertOne(newStudent);
        revalidatePath('/students');
        return { success: true };
    } catch (error) {
        console.error('Error creating student:', error);
        return { success: false, error: 'Failed to create student.' };
    }
}

export async function updateStudent(studentId: string, data: unknown): Promise<{ success: boolean; error?: string | z.ZodError }> {
  if (!studentId) {
    return { success: false, error: 'Student ID is required.' };
  }
  
  // Exclude password from update validation
  const updateStudentSchema = studentSchema.omit({ representativePassword: true });
  const validation = updateStudentSchema.safeParse(data);

  if (!validation.success) {
    return { success: false, error: validation.error };
  }

  const validatedData = validation.data;

  try {
    const db = await getDb();
    
    const studentToUpdate = await db.collection('students').findOne({ id: studentId });
    if (!studentToUpdate) {
        return { success: false, error: 'Student not found.' };
    }
    
    const updatedStudentData = {
        name: validatedData.name,
        dob: validatedData.dob,
        gender: validatedData.gender,
        emergencyContact: {
            name: validatedData.emergencyContactName,
            phone: validatedData.emergencyContactPhone,
            relation: validatedData.emergencyContactRelation,
        },
        medicalInfo: {
            diagnosis: validatedData.diagnosis,
            conditions: validatedData.medicalConditions,
            medications: validatedData.medications,
            allergies: validatedData.allergies,
        },
        pedagogicalInfo: {
            gradeLevel: validatedData.gradeLevel,
            specializationArea: validatedData.specializationArea,
            skillsAndInterests: validatedData.skillsAndInterests,
            supportNeeds: validatedData.supportNeeds,
        },
        representative: {
            name: validatedData.representativeName,
            ci: validatedData.representativeCi,
            relation: validatedData.representativeRelation,
            phone: validatedData.representativePhone,
            email: validatedData.representativeEmail,
            address: validatedData.representativeAddress,
        },
    };

    await db.collection('students').updateOne({ id: studentId }, { $set: updatedStudentData });
    revalidatePath('/students');
    revalidatePath(`/students/${studentId}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating student:', error);
    return { success: false, error: 'Failed to update student.' };
  }
}



export async function getStudentById(id: string): Promise<Student | null> {
    try {
        const db = await getDb();
        const student = await db.collection('students').findOne({ id: id });
        if (!student) {
            return null;
        }
        return JSON.parse(JSON.stringify(student)) as Student;
    } catch (error) {
        console.error('Error fetching student by id:', error);
        return null;
    }
}

export async function deleteStudent(studentId: string): Promise<{ success: boolean; error?: string }> {
    if (!studentId) {
        return { success: false, error: 'Student ID is required.' };
    }

    try {
        const db = await getDb();
        const student = await db.collection('students').findOne({ id: studentId });
        
        if (!student) {
            return { success: false, error: 'Student not found.' };
        }
        
        const result = await db.collection('students').deleteOne({ id: studentId });

        if (result.deletedCount === 0) {
            return { success: false, error: 'Student not found during deletion.' };
        }
        
        // Also delete the representative's user account
        // Note: This is a simplification. In a real app, you'd check if this representative
        // is associated with other students before deleting their user account.
        if (student.representative && student.representative.email) {
            await db.collection('users').deleteOne({ email: student.representative.email });
        }

        // Optionally, delete related data like activity logs and reports
        await db.collection('activityLogs').deleteMany({ studentId });
        await db.collection('progressReports').deleteMany({ studentId });


        revalidatePath('/students');
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Error deleting student:', error);
        return { success: false, error: 'Failed to delete student.' };
    }
}


export async function getActivityLogsByStudentId(studentId: string): Promise<ActivityLog[]> {
    try {
        const db = await getDb();
        const logs = await db.collection('activityLogs').find({ studentId: studentId }).sort({ date: -1 }).toArray();
        return JSON.parse(JSON.stringify(logs));
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        return [];
    }
}

export async function getProgressReportsByStudentId(studentId: string): Promise<ProgressReport[]> {
    try {
        const db = await getDb();
        const reports = await db.collection('progressReports').find({ studentId: studentId }).sort({ date: -1 }).toArray();
        return JSON.parse(JSON.stringify(reports));
    } catch (error) {
        console.error('Error fetching progress reports:', error);
        return [];
    }
}

export async function createActivityLog(logData: Omit<ActivityLog, 'id' | 'date' | '_id'>): Promise<{ success: boolean; error?: string }> {
    try {
        const db = await getDb();
        const newLog = {
            ...logData,
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
        };
        await db.collection('activityLogs').insertOne(newLog);
        revalidatePath(`/students/${logData.studentId}`);
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error creating activity log:', error);
        return { success: false, error: 'Failed to create activity log.' };
    }
}

export async function createProgressReport(reportData: Omit<ProgressReport, 'id' | 'date' | '_id'>): Promise<{ success: boolean; error?: string }> {
    try {
        const db = await getDb();
        const newReport = {
            ...reportData,
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
        };
        await db.collection('progressReports').insertOne(newReport);
        revalidatePath(`/students/${reportData.studentId}`);
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error creating progress report:', error);
        return { success: false, error: 'Failed to create progress report.' };
    }
}


export async function getConversations(): Promise<Conversation[]> {
    try {
        const db = await getDb();
        const conversations = await db.collection('conversations').find({}).toArray();
        return JSON.parse(JSON.stringify(conversations));
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return [];
    }
}

export async function getUpcomingEvents(): Promise<Event[]> {
    try {
        const db = await getDb();
        const today = new Date().toISOString();
        const events = await db.collection('events').find({ date: { $gte: today } }).sort({ date: 1 }).limit(2).toArray();
        return JSON.parse(JSON.stringify(events));
    } catch (error) {
        console.error('Error fetching upcoming events:', error);
        return [];
    }
}


export async function getDashboardStats(): Promise<DashboardStats> {
    try {
        const db = await getDb();
        
        const totalStudents = await db.collection('students').countDocuments();
        
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const recentActivities = await db.collection('activityLogs').countDocuments({ date: { $gte: twentyFourHoursAgo } });

        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay())).toISOString();
        const reportsGenerated = await db.collection('progressReports').countDocuments({ date: { $gte: startOfWeek } });

        const recentConversations = await db.collection('conversations').find().sort({ 'messages.timestamp': -1 }).limit(2).toArray();
        
        const upcomingEvents = await getUpcomingEvents();

        return {
            totalStudents,
            recentActivities,
            reportsGenerated,
            recentConversations: JSON.parse(JSON.stringify(recentConversations)),
            upcomingEvents: JSON.parse(JSON.stringify(upcomingEvents)),
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
            totalStudents: 0,
            recentActivities: 0,
            reportsGenerated: 0,
            recentConversations: [],
            upcomingEvents: [],
        };
    }
}

async function seedResources() {
    const db = await getDb();
    const resourcesCollection = db.collection('resources');
    
    // Clear existing resources to replace them with new ones
    await resourcesCollection.deleteMany({});

    console.log('Seeding TDAH resources...');
    const resources: Omit<Resource, '_id'>[] = [
        {
            id: crypto.randomUUID(),
            title: '¿Qué es el TDAH? Síntomas y Causas',
            description: 'Un artículo completo de la Mayo Clinic que explica los fundamentos del Trastorno por Déficit de Atención e Hiperactividad.',
            category: 'Información General',
            fileUrl: 'https://www.mayoclinic.org/es/diseases-conditions/adhd/symptoms-causes/syc-20350878', 
            thumbnail: {
                id: 'resource-tdah-1',
                description: 'Cerebro con conexiones neuronales',
                imageUrl: 'https://picsum.photos/seed/adhd1/600/400',
                imageHint: 'brain neurons'
            }
        },
        {
            id: crypto.randomUUID(),
            title: 'TDAH en Niños: Cómo Ayudarles',
            description: 'Estrategias y consejos prácticos para padres y educadores sobre cómo apoyar a los niños con TDAH en casa y en la escuela.',
            category: 'Estrategias',
            fileUrl: 'https://childmind.org/article/como-ayudar-a-los-ninos-con-tdah/',
            thumbnail: {
                id: 'resource-tdah-2',
                description: 'Niño concentrado en una tarea',
                imageUrl: 'https://picsum.photos/seed/adhd2/600/400',
                imageHint: 'child studying'
            }
        },
        {
            id: crypto.randomUUID(),
            title: 'Manejo de la Conducta en el TDAH',
            description: 'Técnicas de modificación de conducta y refuerzo positivo para manejar los comportamientos desafiantes asociados al TDAH.',
            category: 'Conducta',
            fileUrl: 'https://www.understood.org/es-mx/articles/behavior-therapy-for-kids-with-adhd-what-you-need-to-know',
            thumbnail: {
                id: 'resource-tdah-3',
                description: 'Gráfico de recompensas o estrellas',
                imageUrl: 'https://picsum.photos/seed/adhd3/600/400',
                imageHint: 'reward chart'
            }
        },
         {
            id: crypto.randomUUID(),
            title: 'TDAH y Alimentación: ¿Hay Conexión?',
            description: 'Exploración sobre cómo la dieta y ciertos alimentos pueden influir en los síntomas del TDAH y recomendaciones nutricionales.',
            category: 'Salud',
            fileUrl: 'https://www.healthychildren.org/Spanish/health-issues/conditions/adhd/Paginas/adhd-and-nutrition.aspx',
            thumbnail: {
                id: 'resource-tdah-4',
                description: 'Plato con alimentos saludables y coloridos',
                imageUrl: 'https://picsum.photos/seed/adhd4/600/400',
                imageHint: 'healthy food'
            }
        },
    ];
    await resourcesCollection.insertMany(resources);
}


export async function getResources(): Promise<Resource[]> {
    try {
        const db = await getDb();
        const count = await db.collection('resources').countDocuments();
        if (count === 0) {
            await seedResources();
        }
        const resources = await db.collection('resources').find({}).toArray();
        return JSON.parse(JSON.stringify(resources));
    } catch (error) {
        console.error('Error fetching resources:', error);
        return [];
    }
}
