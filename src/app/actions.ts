'use server';

/**
 * @fileoverview Server actions for handling client-side requests, such as AI-powered report generation and database interactions.
 */

import {
  generateProgressReport,
  type GenerateProgressReportInput,
} from '@/ai/flows/generate-progress-report';
import {
  generateMessageDraft,
  type GenerateMessageDraftInput,
} from '@/ai/flows/generate-message-draft';
import { 
    generateEvaluationReport,
    type GenerateEvaluationReportInput,
} from '@/ai/flows/generate-evaluation-report';
import { createEvaluationReport } from '@/lib/actions/students';
import { GenerateEvaluationReportInputSchema } from '@/ai/schemas';
import { z } from 'zod';
import clientPromise from '@/lib/mongodb';


const progressReportActionInputSchema = z.object({
  studentName: z.string(),
  learningObjectives: z.string(),
  dailyActivityLogs: z.string(),
});

/**
 * Handles the generation of a student progress report using an AI flow.
 * @param input The data required to generate the report.
 * @returns An object containing the generated report or an error message.
 */
export async function handleGenerateReport(input: GenerateProgressReportInput) {
  try {
    const validatedInput = progressReportActionInputSchema.parse(input);
    const result = await generateProgressReport(validatedInput);
    return { success: true, report: result.progressReport };
  } catch (error) {
    console.error('Error generating progress report:', error);
    let errorMessage = 'An unknown error occurred.';
    if (error instanceof z.ZodError) {
      errorMessage = 'Invalid input data.';
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }
    return { success: false, error: errorMessage, report: null };
  }
}

const messageDraftActionInputSchema = z.object({
  topic: z.string().min(1, 'El tema no puede estar vacío.'),
});

/**
 * Handles the generation of a message draft using an AI flow.
 * @param topic The topic for the message draft.
 * @returns An object containing the generated draft or an error message.
 */
export async function handleGenerateDraft(topic: string) {
    try {
        const validatedInput = messageDraftActionInputSchema.parse({ topic });
        const result = await generateMessageDraft(validatedInput);
        return { success: true, draft: result };
    } catch (error) {
        console.error('Error generating message draft:', error);
        let errorMessage = 'An unknown error occurred.';
        if (error instanceof z.ZodError) {
            errorMessage = 'Invalid input data.';
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }
        return { success: false, error: errorMessage };
    }
}

/**
 * Handles the generation and enhancement of an evaluation report using an AI flow.
 * @param input The title and draft content of the report.
 * @returns An object containing the improved report or an error message.
 */
export async function handleGenerateEvaluationReport(input: GenerateEvaluationReportInput) {
  try {
    const validatedInput = GenerateEvaluationReportInputSchema.parse(input);
    const result = await generateEvaluationReport(validatedInput);
    return { success: true, report: result.report };
  } catch (error) {
    console.error('Error generating evaluation report:', error);
    let errorMessage = 'An unknown error occurred.';
    if (error instanceof z.ZodError) {
      errorMessage = 'Invalid input data.';
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }
    return { success: false, error: errorMessage, report: null };
  }
}

/**
 * Tests the connection to the MongoDB database.
 * @returns A success message if the connection is established.
 */
export async function testDbConnection() {
  const client = await clientPromise;
  await client.db('admin').command({ ping: 1 });
  console.log('Successfully connected to MongoDB.');
  return { success: true, message: 'Conexión a la base de datos exitosa.' };
}


const saveEvaluationReportSchema = z.object({
  studentId: z.string().min(1),
  content: z.string().min(10),
});

/**
 * Saves a finalized evaluation report to the database.
 * @param data The report data, including student ID and content.
 * @returns A success or failure object.
 */
export async function saveEvaluationReport(data: unknown) {
    const validation = saveEvaluationReportSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: 'Datos de informe inválidos.' };
    }
    return createEvaluationReport(validation.data);
}
