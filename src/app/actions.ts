'use server';

import {
  generateProgressReport,
  type GenerateProgressReportInput,
} from '@/ai/flows/generate-progress-report';
import { z } from 'zod';

const actionInputSchema = z.object({
  studentName: z.string(),
  learningObjectives: z.string(),
  dailyActivityLogs: z.string(),
});

export async function handleGenerateReport(input: GenerateProgressReportInput) {
  try {
    const validatedInput = actionInputSchema.parse(input);
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
    return { success: false, error: errorMessage };
  }
}
