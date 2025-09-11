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
      'Improve reading comprehension by one grade level.',
      'Master basic multiplication and division facts.',
      'Develop effective collaboration skills in group projects.',
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
      'Write a coherent five-paragraph essay.',
      'Understand the principles of photosynthesis.',
      'Participate actively in class discussions.',
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
      'Solve two-step algebraic equations.',
      'Identify the main themes in a literary text.',
      'Use correct grammar and punctuation in all written work.',
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
      'Improve public speaking and presentation skills.',
      'Understand the historical context of the Civil Rights Movement.',
      'Apply the scientific method to a hands-on experiment.',
    ],
  },
];

export const activityLogs: ActivityLog[] = [
    {
        id: 'log1',
        studentId: '1',
        date: '2024-07-28',
        teacher: 'Ms. Davis',
        achievements: 'Liam successfully identified the main idea in three short stories and answered comprehension questions with 90% accuracy.',
        challenges: 'He found it difficult to infer character motivations without explicit descriptions.',
        observations: 'Liam is showing great enthusiasm for reading. Using graphic organizers seems to help him structure his thoughts.'
    },
    {
        id: 'log2',
        studentId: '1',
        date: '2024-07-29',
        teacher: 'Ms. Davis',
        achievements: 'Participated actively in a group discussion about a shared text, offering relevant ideas.',
        challenges: 'Still hesitant to lead the conversation but willingly builds on others\' points.',
        observations: 'His confidence in group settings is visibly growing.'
    },
    {
        id: 'log3',
        studentId: '2',
        date: '2024-07-29',
        teacher: 'Mr. Smith',
        achievements: 'Olivia drafted a strong introductory paragraph for her essay on photosynthesis, with a clear thesis statement.',
        challenges: 'Struggled to find credible sources for her research and needed guidance.',
        observations: 'She is a diligent worker and responds well to constructive feedback.'
    }
];

export const progressReports: ProgressReport[] = [
    {
        id: 'rep1',
        studentId: '1',
        date: '2024-06-30',
        content: 'Liam has shown consistent progress in his reading skills. He is beginning to apply various reading strategies to understand complex texts. His participation in group activities has improved, though he could be more assertive. We will continue to focus on inferential thinking and leadership skills in the coming month.'
    }
];

export const conversations: Conversation[] = [
    {
        id: 'conv1',
        contactName: 'Emily Carter',
        contactAvatar: getImage('contact-emily'),
        lastMessagePreview: 'That sounds great, thank you!',
        lastMessageTimestamp: '2:45 PM',
        messages: [
            { id: 'msg1', sender: 'contact', text: 'Hi, I wanted to check in on Noah\'s progress with his algebra homework.', timestamp: '2:40 PM' },
            { id: 'msg2', sender: 'user', text: 'Hi Emily! He\'s doing much better. He scored 85% on the last quiz. We are focusing on word problems this week.', timestamp: '2:42 PM' },
            { id: 'msg3', sender: 'contact', text: 'That sounds great, thank you!', timestamp: '2:45 PM' },
        ]
    },
    {
        id: 'conv2',
        contactName: 'David Lee',
        contactAvatar: getImage('contact-david'),
        lastMessagePreview: 'Okay, I will make sure she reviews them.',
        lastMessageTimestamp: '11:10 AM',
        messages: [
             { id: 'msg4', sender: 'user', text: 'Hi David, just a reminder that Olivia\'s essay draft is due tomorrow. I have attached the rubric to her portal.', timestamp: '11:08 AM' },
             { id: 'msg5', sender: 'contact', text: 'Okay, I will make sure she reviews them.', timestamp: '11:10 AM' },
        ]
    },
    {
        id: 'conv3',
        contactName: 'Sarah Miller',
        contactAvatar: getImage('contact-sarah'),
        lastMessagePreview: 'Can we schedule a brief call for tomorrow?',
        lastMessageTimestamp: 'Yesterday',
        messages: [
             { id: 'msg6', sender: 'contact', text: 'I have some concerns about Liam\'s recent test scores. Can we schedule a brief call for tomorrow?', timestamp: 'Yesterday' },
        ]
    }
];
