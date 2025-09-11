'use server';

/**
 * @fileOverview An AI agent for generating student progress reports from daily activity logs.
 *
 * - generateProgressReport - A function that generates a student progress report.
 * - GenerateProgressReportInput - The input type for the generateProgressReport function.
 * - GenerateProgressReportOutput - The return type for the generateProgressReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProgressReportInputSchema = z.object({
  studentName: z.string().describe('The name of the student.'),
  dailyActivityLogs: z
    .string()
    .describe(
      'A list of daily activity logs for the student. Each log entry should include the date, activities performed, achievements, challenges, and observations.'
    ),
  learningObjectives: z
    .string()
    .describe('The learning objectives for the student.'),
});
export type GenerateProgressReportInput = z.infer<
  typeof GenerateProgressReportInputSchema
>;

const GenerateProgressReportOutputSchema = z.object({
  progressReport: z.string().describe('The generated progress report.'),
});
export type GenerateProgressReportOutput = z.infer<
  typeof GenerateProgressReportOutputSchema
>;

export async function generateProgressReport(
  input: GenerateProgressReportInput
): Promise<GenerateProgressReportOutput> {
  return generateProgressReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProgressReportPrompt',
  input: {schema: GenerateProgressReportInputSchema},
  output: {schema: GenerateProgressReportOutputSchema},
  prompt: `You are an AI assistant that specializes in creating student progress reports based on their daily activity logs and learning objectives.

  Student Name: {{{studentName}}}
  Learning Objectives: {{{learningObjectives}}}
  Daily Activity Logs: {{{dailyActivityLogs}}}

  Generate a comprehensive progress report for the student, highlighting their achievements, challenges, and areas for improvement. Incorporate specific observations from the daily activity logs to provide a detailed evaluation of the student's progress toward their learning objectives.`,
});

const generateProgressReportFlow = ai.defineFlow(
  {
    name: 'generateProgressReportFlow',
    inputSchema: GenerateProgressReportInputSchema,
    outputSchema: GenerateProgressReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
