'use server';

/**
 * @fileOverview Un agente de IA para generar informes de progreso de estudiantes a partir de registros de actividad diaria.
 *
 * - generateProgressReport - Una función que genera un informe de progreso del estudiante.
 * - GenerateProgressReportInput - El tipo de entrada para la función generateProgressReport.
 * - GenerateProgressReportOutput - El tipo de retorno para la función generateProgressReport.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  GenerateProgressReportInputSchema,
  GenerateProgressReportOutputSchema,
} from '@/ai/schemas';

export type GenerateProgressReportInput = z.infer<
  typeof GenerateProgressReportInputSchema
>;
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
  prompt: `Eres un asistente de IA que se especializa en crear informes de progreso de estudiantes basados en sus registros de actividad diaria y objetivos de aprendizaje.

  Nombre del Estudiante: {{{studentName}}}
  Objetivos de Aprendizaje: {{{learningObjectives}}}
  Registros de Actividad Diaria: {{{dailyActivityLogs}}}

  Genera un informe de progreso completo para el estudiante, destacando sus logros, desafíos y áreas de mejora. Incorpora observaciones específicas de los registros de actividad diaria para proporcionar una evaluación detallada del progreso del estudiante hacia sus objetivos de aprendizaje.`,
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
