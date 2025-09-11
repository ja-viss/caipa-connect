import type { ImagePlaceholder } from './placeholder-images';

export type Student = {
  id: string;
  name: string;
  avatar: ImagePlaceholder;
  email: string;
  representative: {
    name: string;
    email: string;
  };
  learningObjectives: string[];
};

export type ActivityLog = {
  id: string;
  studentId: string;
  date: string;
  teacher: string;
  achievements: string;
  challenges: string;
  observations: string;
};

export type ProgressReport = {
  id: string;
  studentId: string;
  date: string;
  content: string;
};

export type Message = {
  id: string;
  sender: 'user' | 'contact';
  text: string;
  timestamp: string;
};

export type Conversation = {
  id: string;
  contactName: string;
  contactAvatar: ImagePlaceholder;
  messages: Message[];
  lastMessagePreview: string;
  lastMessageTimestamp: string;
};
