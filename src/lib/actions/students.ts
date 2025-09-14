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
  
  const updateStudentSchema = studentSchema.omit({ representativePassword: true }).extend({
    representativePassword: z.string().optional(),
  });
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
    
    // Update Representative's User Account if it exists
    const repUser = await db.collection('users').findOne({ email: validatedData.representativeEmail });
    if (repUser) {
        const userUpdateData: { fullName: string; password?: string } = {
            fullName: validatedData.representativeName,
        };
        if (validatedData.representativePassword && validatedData.representativePassword.length >= 6) {
            userUpdateData.password = validatedData.representativePassword; // Hash in real app
        }
        await db.collection('users').updateOne({ email: validatedData.representativeEmail }, { $set: userUpdateData });
    }

    // Update student's data
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
    revalidatePath('/admin/users'); // Revalidate users page in case rep name changed
    
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

export async function getStudentByRepEmail(email: string): Promise<Student | null> {
    try {
        const db = await getDb();
        const student = await db.collection('students').findOne({ 'representative.email': email });
         if (!student) {
            return null;
        }
        return JSON.parse(JSON.stringify(student)) as Student;
    } catch (error) {
        console.error('Error fetching student by representative email:', error);
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
        revalidatePath('/representative/dashboard');
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
        revalidatePath('/representative/dashboard');
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
    
    await resourcesCollection.deleteMany({});

    const resources: Omit<Resource, '_id'>[] = [
        {
            id: crypto.randomUUID(),
            title: '¿Qué es el TDAH? Síntomas y Causas',
            description: 'Un artículo completo de la Mayo Clinic que explica los fundamentos del Trastorno por Déficit de Atención e Hiperactividad.',
            category: 'Información General',
            content: `El trastorno por déficit de atención e hiperactividad (TDAH) es una de las afecciones neuroconductuales más comunes de la niñez. Usualmente se diagnostica por primera vez en la niñez y a menudo perdura hasta la adultez. Los niños con TDAH pueden tener problemas para prestar atención, controlar conductas impulsivas (pueden actuar sin pensar cuál será el resultado) o ser excesivamente activos.

Signos y síntomas
Es normal que a los niños les cueste trabajo concentrarse y comportarse bien de vez en cuando. Sin embargo, los niños con TDAH no van dejando atrás esas conductas a medida que crecen. Los síntomas continúan y pueden provocar dificultades en la escuela, el hogar o con los amigos.

Un niño con TDAH puede presentar los siguientes comportamientos:
- Fantasear mucho.
- Olvidar o perder las cosas con mucha frecuencia.
- Retorcerse o moverse nerviosamente.
- Hablar mucho.
- Cometer errores por descuido o correr riesgos innecesarios.
- Tener problemas para resistir la tentación.
- Tener problemas para respetar los turnos.
- Tener dificultades para llevarse bien con los demás.

Causas del TDAH
Las causas y los factores de riesgo del TDAH se desconocen, pero investigaciones actuales muestran que la genética desempeña un papel importante. Estudios de gemelos, familias y adopción muestran que el TDAH tiene una fuerte base genética.

Además de la genética, los científicos están estudiando otras posibles causas y factores de riesgo, entre ellos:
- Lesión cerebral
- Exposición ambiental (p. ej., al plomo)
- Consumo de alcohol o tabaco durante el embarazo
- Parto prematuro
- Bajo peso al nacer

La investigación no respalda las opiniones populares de que el TDAH se origina por comer demasiada azúcar, ver demasiada televisión, por la crianza de los hijos o por factores sociales y ambientales como la pobreza o el caos familiar.`,
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
            content: `Ayudar a un niño con TDAH puede ser un desafío, pero existen muchas estrategias efectivas. La clave es la consistencia y la paciencia.

En Casa:
1. Cree una rutina: Intente seguir el mismo horario todos los días, desde la hora de despertarse hasta la de acostarse. Incluya horarios para las comidas, las tareas y el juego.
2. Organice las cosas de todos los días: Tenga un lugar para todo y mantenga la casa organizada. Esto incluye ropa, mochilas y juguetes.
3. Use organizadores para las tareas escolares: Use carpetas y cuadernos para organizar las tareas escolares. Divida las tareas largas en partes más pequeñas.
4. Sea claro y consistente: Los niños con TDAH necesitan reglas claras que puedan entender y seguir. Asegúrese de que las consecuencias por infringir las reglas sean consistentes.
5. Dé elogios o recompensas cuando se sigan las reglas: Elogie o recompense el buen comportamiento de inmediato.

En la Escuela:
1. Hable con los maestros: Comuníquese regularmente con los maestros de su hijo. Averigüe cómo le está yendo y trabajen juntos para encontrar soluciones a cualquier problema.
2. Solicite adaptaciones: Los niños con TDAH pueden ser elegibles para recibir adaptaciones especiales en la escuela, como más tiempo en los exámenes, instrucciones escritas o sentarse cerca del maestro.
3. Fomente las habilidades sociales: Ayude a su hijo a desarrollar habilidades sociales. Enséñele a leer las expresiones faciales y el lenguaje corporal de las personas. Represente situaciones sociales con él.`,
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
            content: `La terapia de conducta es un tratamiento eficaz para el TDAH que puede mejorar el comportamiento, el autocontrol y la autoestima de un niño. Se centra en enseñar a los niños nuevas formas de pensar y actuar.

Principios clave de la terapia de conducta:
1. Establecer metas específicas: En lugar de "pórtate bien", una meta específica podría ser "completa tu tarea de matemáticas antes de la cena".
2. Proporcionar recompensas y consecuencias: Recompense a su hijo por alcanzar sus metas. Las consecuencias por mal comportamiento deben ser claras y consistentes.
3. Usar un sistema de fichas o puntos: Los niños pueden ganar puntos o fichas por buen comportamiento y canjearlos por recompensas.
4. Ignorar comportamientos levemente negativos: A veces, ignorar un comportamiento molesto pero no peligroso es más efectivo que prestarle atención.
5. Tiempo fuera (Time-out): El tiempo fuera puede ser una consecuencia efectiva para el mal comportamiento. Le da al niño la oportunidad de calmarse.

Trabajar con un terapeuta:
Un terapeuta capacitado puede ayudarlo a crear un plan de manejo del comportamiento para su hijo. También pueden trabajar directamente con su hijo para enseñarle habilidades para manejar sus síntomas de TDAH. La terapia a menudo incluye a los padres, ya que la consistencia entre el hogar y la terapia es crucial.`,
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
            content: `Aunque la investigación no ha demostrado que la comida cause TDAH, algunos estudios sugieren que ciertos alimentos pueden afectar el comportamiento de algunos niños con TDAH. Es importante recordar que la dieta por sí sola no es un tratamiento para el TDAH.

Recomendaciones Nutricionales Generales:
- Coma una dieta balanceada: Asegúrese de que su hijo coma una variedad de alimentos saludables, incluyendo frutas, verduras, granos integrales, proteínas magras y grasas saludables.
- Evite los alimentos procesados: Los alimentos con alto contenido de azúcar, colorantes artificiales y conservantes pueden empeorar los síntomas en algunos niños.
- Considere los ácidos grasos omega-3: Algunos estudios sugieren que los suplementos de omega-3 pueden ayudar a mejorar los síntomas del TDAH. Los omega-3 se encuentran en pescados como el salmón y el atún.
- Hable con su médico: Antes de realizar cambios importantes en la dieta de su hijo o de darle suplementos, hable con su pediatra o un dietista registrado.

Dietas de eliminación:
Algunos padres prueban dietas de eliminación, en las que se eliminan ciertos alimentos (como el gluten, los lácteos o los colorantes artificiales) para ver si los síntomas mejoran. Si bien algunos padres informan mejoras, la evidencia científica es mixta. Este tipo de dieta debe realizarse bajo la supervisión de un profesional de la salud para garantizar que el niño reciba una nutrición adecuada.`,
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
