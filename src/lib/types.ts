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
  dob: string;
  gender: string;
  avatar?: ImagePlaceholder;
  
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  
  medicalInfo: {
    diagnosis: string;
    conditions: string;
    medications: string;
    allergies: string;
  };

  pedagogicalInfo: {
    gradeLevel: string;
    specializationArea: string;
    skillsAndInterests: string;
    supportNeeds: string;
  };

  representative: {
    name: string;
    relation: string;
    phone: string;
    email: string;
    address?: string;
  };
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
  _id?: ObjectId;
  id: string;
  contactName: string;
  contactAvatar: ImagePlaceholder;
  messages: Message[];
  lastMessagePreview: string;
  lastMessageTimestamp: string;
};

export type Event = {
    _id?: ObjectId;
    id: string;
    title: string;
    description: string;
    date: string;
};

export type DashboardStats = {
  totalStudents: number;
  recentActivities: number;
  reportsGenerated: number;
  recentConversations: Conversation[];
  upcomingEvents: Event[];
}
