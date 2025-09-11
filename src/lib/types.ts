import type { ImagePlaceholder } from './placeholder-images';
import type { ObjectId } from 'mongodb';

export type User = {
  _id?: ObjectId;
  id: string;
  fullName: string;
  email: string;
  password?: string; // Should be hashed in a real app
  role: 'admin' | 'teacher' | 'representative';
};

export type Student = {
  _id?: ObjectId;
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
  _id?: ObjectId;
  id: string;
  studentId: string;
  date: string;
  teacher: string;
  achievements: string;
  challenges: string;
  observations: string;
};

export type ProgressReport = {
  _id?: ObjectId;
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
