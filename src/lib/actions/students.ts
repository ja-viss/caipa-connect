'use server';

import clientPromise from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';
import type { Student, ActivityLog, ProgressReport, Conversation, DashboardStats, Event } from '@/lib/types';
import { PlaceHolderImages } from '../placeholder-images';
import { z } from 'zod';
import { ObjectId } from 'mongodb';


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

const createStudentSchema = z.object({
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
  representativeRelation: z.string().min(1, 'La relación con el estudiante es obligatoria.'),
  representativePhone: z.string().min(1, 'El teléfono del representante es obligatorio.'),
  representativeEmail: z.string().email('Correo electrónico de representante inválido.'),
  representativeAddress: z.string().optional(),
});


export async function createStudent(data: unknown): Promise<{ success: boolean; error?: string | z.ZodError }> {
    const validation = createStudentSchema.safeParse(data);

    if (!validation.success) {
      return { success: false, error: validation.error };
    }
    
    const validatedData = validation.data;
    
    try {
        const db = await getDb();
        const randomAvatar = PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)];
        
        const newStudent: Omit<Student, '_id' | 'email' | 'learningObjectives'> = {
            id: crypto.randomUUID(),
            name: validatedData.name,
            dob: validatedData.dob,
            gender: validatedData.gender,
            avatar: randomAvatar,
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
        const result = await db.collection('students').deleteOne({ id: studentId });

        if (result.deletedCount === 0) {
            return { success: false, error: 'Student not found.' };
        }
        
        // Optionally, delete related data like activity logs and reports
        await db.collection('activityLogs').deleteMany({ studentId });
        await db.collection('progressReports').deleteMany({ studentId });


        revalidatePath('/students');
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
