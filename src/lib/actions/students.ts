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

        if (userResult?.error || !userResult?.userId) {
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
                userId: userResult.userId, // Link the user account
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
            ...studentToUpdate.representative, // Preserve existing fields like userId
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

export async function getActivityLogsForReport(studentId: string, startDate: string, endDate: string): Promise<ActivityLog[]> {
    try {
        const db = await getDb();
        const logs = await db.collection('activityLogs').find({
            studentId: studentId,
            date: {
                $gte: new Date(startDate).toISOString(),
                $lte: new Date(endDate).toISOString(),
            }
        }).sort({ date: 1 }).toArray();
        return JSON.parse(JSON.stringify(logs));
    } catch (error) {
        console.error('Error fetching activity logs for report:', error);
        return [];
    }
}

export async function getProgressReportsByStudentId(studentId: string): Promise<ProgressReport[]> {
    try {
        const db = await getDb();
        const reports = await db.collection('progressReports').find({ studentId: studentId, type: 'progress' }).sort({ date: -1 }).toArray();
        return JSON.parse(JSON.stringify(reports));
    } catch (error) {
        console.error('Error fetching progress reports:', error);
        return [];
    }
}

export async function getEvaluationReportsByStudentId(studentId: string): Promise<ProgressReport[]> {
    try {
        const db = await getDb();
        const reports = await db.collection('progressReports').find({ studentId: studentId, type: 'evaluation' }).sort({ date: -1 }).toArray();
        return JSON.parse(JSON.stringify(reports));
    } catch (error) {
        console.error('Error fetching evaluation reports:', error);
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

export async function createProgressReport(reportData: Omit<ProgressReport, 'id' | 'date' | '_id' | 'type'>): Promise<{ success: boolean; error?: string }> {
    try {
        const db = await getDb();
        const newReport = {
            ...reportData,
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            type: 'progress'
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

export async function createEvaluationReport(reportData: { studentId: string; content: string }): Promise<{ success: boolean; error?: string }> {
    try {
        const db = await getDb();
        const newReport = {
            ...reportData,
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            type: 'evaluation'
        };
        await db.collection('progressReports').insertOne(newReport);
        revalidatePath('/reports');
        return { success: true };
    } catch (error) {
        console.error('Error creating evaluation report:', error);
        return { success: false, error: 'Failed to create evaluation report.' };
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
            title: '¿Qué es el TDAH? Una Guía Completa',
            description: 'Un artículo detallado que explica los fundamentos del Trastorno por Déficit de Atención e Hiperactividad, sus síntomas, causas y tipos.',
            category: 'Información General',
            content: `El Trastorno por Déficit de Atención e Hiperactividad (TDAH) es una condición neurobiológica que afecta a millones de niños y a menudo continúa en la edad adulta. Se caracteriza por un patrón persistente de falta de atención y/o hiperactividad-impulsividad que interfiere con el funcionamiento o el desarrollo.

**Síntomas Principales:**

*   **Falta de Atención:** Dificultad para mantener la atención en tareas o juegos, no parecer escuchar cuando se le habla directamente, no seguir instrucciones y no terminar las tareas, tener problemas para organizar tareas y actividades, evitar o disgustarle las tareas que requieren un esfuerzo mental sostenido, perder cosas necesarias para las tareas y distraerse fácilmente.
*   **Hiperactividad-Impulsividad:** Juguetear y retorcerse en el asiento, levantarse en situaciones en las que se espera que permanezca sentado, correr o trepar en situaciones inapropiadas, ser incapaz de jugar o participar en actividades tranquilas, estar "en movimiento", actuar como si "lo impulsara un motor", hablar excesivamente, responder inesperadamente o antes de que se haya completado una pregunta, tener dificultades para esperar su turno e interrumpir o entrometerse con otros.

**Tipos de TDAH:**

1.  **Presentación con predominio de falta de atención:** La mayoría de los síntomas corresponden a la falta de atención.
2.  **Presentación con predominio hiperactivo-impulsivo:** La mayoría de los síntomas son de hiperactividad e impulsividad.
3.  **Presentación combinada:** Hay una mezcla de síntomas de falta de atención y síntomas de hiperactividad-impulsividad.

**Causas:**
Si bien la causa exacta del TDAH no se conoce, las investigaciones sugieren que la genética juega un papel importante. Otros factores que pueden influir incluyen desequilibrios en los neurotransmisores del cerebro, diferencias en la estructura cerebral, y factores ambientales como la exposición al plomo o el consumo de alcohol/tabaco durante el embarazo.`,
            thumbnail: {
                id: 'resource-tdah-1',
                description: 'Cerebro con conexiones neuronales iluminadas',
                imageUrl: 'https://picsum.photos/seed/adhd1/600/400',
                imageHint: 'brain neurons'
            }
        },
        {
            id: crypto.randomUUID(),
            title: 'Estrategias de Apoyo para Niños con TDAH',
            description: 'Consejos prácticos para padres y educadores sobre cómo crear un entorno de apoyo y estructurado para niños con TDAH.',
            category: 'Estrategias',
            content: `Apoyar a un niño con TDAH requiere paciencia, creatividad y consistencia. Las estrategias efectivas pueden marcar una gran diferencia en su éxito académico y social.

**Estrategias para el Hogar:**

*   **Establecer Rutinas Claras:** Los niños con TDAH prosperan con la estructura. Mantén horarios consistentes para las comidas, tareas, juegos y la hora de dormir. Usa un calendario grande o una pizarra para visualizar el horario diario y semanal.
*   **Organización del Entorno:** Designa lugares específicos para objetos importantes como mochilas, llaves y útiles escolares. Usa cajas de almacenamiento etiquetadas y organizadores para mantener el orden.
*   **Dividir Tareas Grandes:** Las tareas complejas pueden ser abrumadoras. Divídelas en pasos más pequeños y manejables. Por ejemplo, en lugar de "limpia tu cuarto", usa una lista de verificación: "1. Haz la cama, 2. Guarda los juguetes, 3. Pon la ropa sucia en el cesto".
*   **Comunicación Clara y Directa:** Da instrucciones una a la vez y de manera concisa. Establece contacto visual y pide al niño que repita las instrucciones para asegurar la comprensión.
*   **Fomentar el Refuerzo Positivo:** Reconoce y elogia los esfuerzos y logros, por pequeños que sean. Un sistema de recompensas (como ganar puntos para una actividad especial) puede ser muy motivador.

**Estrategias para la Escuela:**

*   **Colaboración con los Docentes:** Mantén una comunicación abierta y regular con los maestros. Comparte qué estrategias funcionan en casa y pregunta por el progreso y los desafíos en el aula.
*   **Ubicación Estratégica en el Aula:** Sentarse cerca del maestro y lejos de distracciones como puertas o ventanas puede ayudar a mejorar la concentración.
*   **Adaptaciones Académicas:** Solicita adaptaciones razonables, como tiempo extra para los exámenes, el uso de audífonos para reducir el ruido, o la entrega de instrucciones tanto verbales como escritas.
*   **Pausas Activas:** Permitir breves descansos para moverse (por ejemplo, entregar un mensaje, borrar la pizarra) puede ayudar al niño a liberar energía y a volver a concentrarse.`,
            thumbnail: {
                id: 'resource-tdah-2',
                description: 'Un niño enfocado y sonriente trabajando en un escritorio ordenado',
                imageUrl: 'https://picsum.photos/seed/adhd2/600/400',
                imageHint: 'child studying'
            }
        },
        {
            id: crypto.randomUUID(),
            title: 'Manejo de Conductas Desafiantes',
            description: 'Técnicas de refuerzo positivo y estrategias para prevenir y manejar crisis de conducta asociadas al TDAH.',
            category: 'Conducta',
            content: `La terapia de conducta es un pilar fundamental en el tratamiento del TDAH. Enseña a los niños y a sus familias a gestionar los comportamientos desafiantes y a fomentar conductas positivas.

**Técnicas Clave de Manejo Conductual:**

*   **Refuerzo Positivo:** Es la estrategia más poderosa. Consiste en recompensar de inmediato un comportamiento deseado. Las recompensas pueden ser elogios verbales ("¡Me encanta cómo te sentaste a hacer la tarea!"), actividades especiales o sistemas de puntos/fichas.
*   **Ignorar Selectivamente:** Algunos comportamientos menores que buscan atención (como quejarse o hacer ruiditos) pueden disminuir si se ignoran de forma consistente, siempre y cuando no sean peligrosos o disruptivos para otros.
*   **Establecer Consecuencias Claras y Lógicas:** Las consecuencias deben ser inmediatas, consistentes y estar directamente relacionadas con la conducta. Por ejemplo, si un niño no guarda sus juguetes, la consecuencia lógica es que no podrá usarlos por un corto período.
*   **Tiempo Fuera (Time-Out):** Utilizado correctamente, el "tiempo fuera" no es un castigo, sino una oportunidad para que el niño se calme en un espacio tranquilo. Debe ser breve (generalmente un minuto por año de edad) y usarse para conductas agresivas o desafiantes específicas.
*   **Crear un Plan de Comportamiento:** Trabaja con tu hijo para establecer 3-5 metas de comportamiento claras y positivas (ej. "Hablar con un tono de voz respetuoso"). Luego, crea un sistema de recompensas para cuando cumpla esas metas.

**Prevención de Crisis:**
*   **Anticipar Desencadenantes:** Identifica situaciones que suelen provocar conductas desafiantes (hambre, cansancio, sobreestimulación).
*   **Ofrecer Opciones:** Dar al niño un sentido de control dándole a elegir entre dos opciones aceptables (ej. "¿Prefieres ducharte ahora o en 10 minutos?").
*   **Usar el "Primero/Después":** Estructura las peticiones de forma clara: "Primero guardamos los bloques, después vamos al parque".`,
            thumbnail: {
                id: 'resource-tdah-3',
                description: 'Un gráfico de recompensas con estrellas y caritas felices',
                imageUrl: 'https://picsum.photos/seed/adhd3/600/400',
                imageHint: 'reward chart'
            }
        },
         {
            id: crypto.randomUUID(),
            title: 'Nutrición y TDAH: ¿Qué Dice la Ciencia?',
            description: 'Una mirada basada en evidencia sobre cómo la dieta y ciertos nutrientes pueden influir en los síntomas del TDAH.',
            category: 'Salud',
            content: `Si bien la dieta no causa ni cura el TDAH, un patrón de alimentación saludable es crucial para todos los niños, y puede ser especialmente beneficioso para aquellos con TDAH, ya que ayuda a optimizar la función cerebral y a estabilizar los niveles de energía.

**Recomendaciones Nutricionales Basadas en Evidencia:**

*   **Dieta Equilibrada y Completa:** Prioriza una dieta rica en frutas, verduras, granos integrales, proteínas magras (pollo, pescado, frijoles) y grasas saludables (aguacate, nueces, aceite de oliva). Esto proporciona los nutrientes esenciales que el cerebro necesita para funcionar correctamente.
*   **Proteínas en el Desayuno:** Un desayuno alto en proteínas puede mejorar la concentración y el tiempo de atención durante la mañana. Ayuda a prevenir picos de azúcar en sangre que pueden llevar a la irritabilidad.
*   **Ácidos Grasos Omega-3:** Existe evidencia creciente de que los suplementos de Omega-3 (que se encuentran en pescados grasos como el salmón) pueden ayudar a reducir los síntomas del TDAH. Consulta siempre a un médico antes de iniciar cualquier suplementación.
*   **Hierro y Zinc:** Las deficiencias en minerales como el hierro y el zinc se han asociado con un empeoramiento de los síntomas del TDAH. Un análisis de sangre puede determinar si existe una deficiencia.
*   **Limitar Azúcares y Aditivos:** Aunque el debate científico continúa, muchos padres reportan una mejoría en el comportamiento al reducir el consumo de azúcares refinados, edulcorantes artificiales y colorantes alimentarios. Una dieta basada en alimentos integrales y no procesados minimiza naturalmente estos componentes.

**¿Qué hay de las dietas de eliminación?**
Algunas teorías sugieren eliminar alérgenos comunes como el gluten o los lácteos. Si bien puede ser útil para niños con sensibilidades o alergias reales, no hay pruebas concluyentes de que beneficie a todos los niños con TDAH. Este tipo de dietas deben realizarse siempre bajo la supervisión de un profesional de la salud para evitar deficiencias nutricionales.`,
            thumbnail: {
                id: 'resource-tdah-4',
                description: 'Un plato colorido con salmón, brócoli, y aguacate',
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
