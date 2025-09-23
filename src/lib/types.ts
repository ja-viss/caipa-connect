import type { ImagePlaceholder } from './placeholder-images';
import type { ObjectId } from 'mongodb';
import type { z } from 'zod';
import type { GenerateEvaluationReportInputSchema } from '@/ai/schemas';

export type SecurityQuestion = {
  question: string;
  answer: string;
};

export type User = {
  _id?: ObjectId;
  id: string;
  fullName: string;
  email: string;
  password?: string; // Should be hashed in a real app
  role: 'admin' | 'teacher' | 'representative';
  teacherId?: string; // Add this to link to a teacher profile
  avatarUrl?: string;
  securityQuestions?: SecurityQuestion[];
};

export type Student = {
  _id?: ObjectId;
  id: string;
  name: string;
  dob: string;
  gender: string;
  avatarUrl?: string;
  
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
    userId?: string; // Add this to link to a user account
    name: string;
    ci: string;
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
  type: 'progress' | 'evaluation';
};

export type Message = {
  _id?: ObjectId;
  id: string;
  senderId: string; // e.g., 'admin-user-id'
  recipient: {
    type: 'all-teachers' | 'all-reps' | 'teacher' | 'rep';
    id?: string; // teacherId or representative email
  };
  subject: string;
  body: string;
  timestamp: string;
  readBy: string[]; // Array of user emails who have read the message
};


export type Conversation = {
  _id?: ObjectId;
  id: string;
  contactName: string;
  contactAvatar: ImagePlaceholder;
  messages: {
    id: string;
    sender: 'user' | 'contact';
    text: string;
    timestamp: string;
  }[];
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

export type Resource = {
  _id?: ObjectId;
  id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  thumbnail: ImagePlaceholder;
};

export type DashboardStats = {
  totalStudents: number;
  recentActivities: number;
  reportsGenerated: number;
  recentConversations: Conversation[];
  upcomingEvents: Event[];
  studentsByArea: { name: string; studentCount: number }[];
  studentsByGender: { name: string; count: number }[];
};

export type Teacher = {
    _id?: ObjectId;
    id: string;
    fullName: string;
    ci: string;
    email: string;
    phone: string;
    specialization: string;
    avatarUrl?: string;
};

export type Area = {
  _id?: ObjectId;
  id: string;
  name: string;
  description: string;
  teacherIds?: string[];
  studentIds?: string[];
};

export type ScheduleEntry = {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  areaId: string;
};

export type Classroom = {
  _id?: ObjectId;
  id: string;
  name: string;
  building: string;
  schedule: ScheduleEntry[];
};

export type GenerateEvaluationReportInput = z.infer<typeof GenerateEvaluationReportInputSchema>;
