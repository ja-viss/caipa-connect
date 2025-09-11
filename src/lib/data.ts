import { PlaceHolderImages } from './placeholder-images';
import type { Student, ActivityLog, ProgressReport, Conversation } from './types';

const getImage = (id: string) => {
  const image = PlaceHolderImages.find((img) => img.id === id);
  if (!image) {
    throw new Error(`Image with id ${id} not found.`);
  }
  return image;
};

export const students: Student[] = [
  {
    id: '1',
    name: 'Liam Johnson',
    avatar: getImage('student-liam'),
    email: 'liam.johnson@example.com',
    representative: {
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
    },
    learningObjectives: [
      'Mejorar la comprensión lectora en un nivel de grado.',
      'Dominar las operaciones básicas de multiplicación y división.',
      'Desarrollar habilidades de colaboración efectivas en proyectos grupales.',
    ],
  },
  {
    id: '2',
    name: 'Olivia Chen',
    avatar: getImage('student-olivia'),
    email: 'olivia.chen@example.com',
    representative: {
      name: 'David Chen',
      email: 'david.c@example.com',
    },
    learningObjectives: [
      'Escribir un ensayo coherente de cinco párrafos.',
      'Comprender los principios de la fotosíntesis.',
      'Participar activamente en las discusiones de clase.',
    ],
  },
  {
    id: '3',
    name: 'Noah Taylor',
    avatar: getImage('student-noah'),
    email: 'noah.taylor@example.com',
    representative: {
      name: 'Emily Taylor',
      email: 'emily.t@example.com',
    },
    learningObjectives: [
      'Resolver ecuaciones algebraicas de dos pasos.',
      'Identificar los temas principales en un texto literario.',
      'Usar correctamente la gramática y la puntuación en todos los trabajos escritos.',
    ],
  },
    {
    id: '4',
    name: 'Emma Garcia',
    avatar: getImage('student-emma'),
    email: 'emma.garcia@example.com',
    representative: {
      name: 'Maria Garcia',
      email: 'maria.g@example.com',
    },
    learningObjectives: [
      'Mejorar las habilidades de hablar en público y de presentación.',
      'Comprender el contexto histórico del Movimiento por los Derechos Civiles.',
      'Aplicar el método científico a un experimento práctico.',
    ],
  },
];

export const activityLogs: ActivityLog[] = [
    {
        id: 'log1',
        studentId: '1',
        date: '2024-07-28',
        teacher: 'Sra. Davis',
        achievements: 'Liam identificó con éxito la idea principal en tres cuentos y respondió preguntas de comprensión con un 90% de precisión.',
        challenges: 'Le resultó difícil inferir las motivaciones de los personajes sin descripciones explícitas.',
        observations: 'Liam muestra gran entusiasmo por la lectura. El uso de organizadores gráficos parece ayudarle a estructurar sus pensamientos.'
    },
    {
        id: 'log2',
        studentId: '1',
        date: '2024-07-29',
        teacher: 'Sra. Davis',
        achievements: 'Participó activamente en una discusión grupal sobre un texto compartido, ofreciendo ideas relevantes.',
        challenges: 'Todavía duda en liderar la conversación pero complementa voluntariamente los puntos de los demás.',
        observations: 'Su confianza en entornos grupales está creciendo visiblemente.'
    },
    {
        id: 'log3',
        studentId: '2',
        date: '2024-07-29',
        teacher: 'Sr. Smith',
        achievements: 'Olivia redactó un párrafo introductorio sólido para su ensayo sobre la fotosíntesis, con una declaración de tesis clara.',
        challenges: 'Tuvo dificultades para encontrar fuentes creíbles para su investigación y necesitó orientación.',
        observations: 'Es una trabajadora diligente y responde bien a los comentarios constructivos.'
    }
];

export const progressReports: ProgressReport[] = [
    {
        id: 'rep1',
        studentId: '1',
        date: '2024-06-30',
        content: 'Liam ha mostrado un progreso constante en sus habilidades de lectura. Está comenzando a aplicar diversas estrategias de lectura para comprender textos complejos. Su participación en actividades grupales ha mejorado, aunque podría ser más asertivo. Continuaremos enfocándonos en el pensamiento inferencial y las habilidades de liderazgo en el próximo mes.'
    }
];

export const conversations: Conversation[] = [
    {
        id: 'conv1',
        contactName: 'Emily Carter',
        contactAvatar: getImage('contact-emily'),
        lastMessagePreview: '¡Eso suena genial, gracias!',
        lastMessageTimestamp: '14:45',
        messages: [
            { id: 'msg1', sender: 'contact', text: 'Hola, quería saber cómo va el progreso de Noah con su tarea de álgebra.', timestamp: '14:40' },
            { id: 'msg2', sender: 'user', text: '¡Hola Emily! Le va mucho mejor. Obtuvo un 85% en el último examen. Esta semana nos estamos centrando en los problemas de palabras.', timestamp: '14:42' },
            { id: 'msg3', sender: 'contact', text: '¡Eso suena genial, gracias!', timestamp: '14:45' },
        ]
    },
    {
        id: 'conv2',
        contactName: 'David Lee',
        contactAvatar: getImage('contact-david'),
        lastMessagePreview: 'De acuerdo, me aseguraré de que los revise.',
        lastMessageTimestamp: '11:10',
        messages: [
             { id: 'msg4', sender: 'user', text: 'Hola David, solo un recordatorio de que el borrador del ensayo de Olivia vence mañana. He adjuntado la rúbrica a su portal.', timestamp: '11:08' },
             { id: 'msg5', sender: 'contact', text: 'De acuerdo, me aseguraré de que los revise.', timestamp: '11:10' },
        ]
    },
    {
        id: 'conv3',
        contactName: 'Sarah Miller',
        contactAvatar: getImage('contact-sarah'),
        lastMessagePreview: '¿Podemos programar una breve llamada para mañana?',
        lastMessageTimestamp: 'Ayer',
        messages: [
             { id: 'msg6', sender: 'contact', text: 'Tengo algunas preocupaciones sobre los resultados recientes de los exámenes de Liam. ¿Podemos programar una breve llamada para mañana?', timestamp: 'Ayer' },
        ]
    }
];
