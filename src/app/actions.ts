'use server';

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
    GenerateEvaluationReportInputSchema,
    type GenerateEvaluationReportInput,
} from '@/ai/flows/generate-evaluation-report';
import { z } from 'zod';

const progressReportActionInputSchema = z.object({
  studentName: z.string(),
  learningObjectives: z.string(),
  dailyActivityLogs: z.string(),
});

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


export async function handleGenerateEvaluationReport(input: GenerateEvaluationReportInput) {
  try {
    const validatedInput = GenerateEvaluationReportInputSchema.parse(input);
    if (!validatedInput.activityLogs.trim()) {
        return { success: false, error: 'No se encontraron registros de actividad para el período y área seleccionados.', report: null };
    }
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
