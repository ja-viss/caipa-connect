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

const GenerateProgressReportInputSchema = z.object({
  studentName: z.string().describe('El nombre del estudiante.'),
  dailyActivityLogs: z
    .string()
    .describe(
      'Una lista de registros de actividad diaria para el estudiante. Cada entrada de registro debe incluir la fecha, actividades realizadas, logros, desafíos y observaciones.'
    ),
  learningObjectives: z
    .string()
    .describe('Los objetivos de aprendizaje para el estudiante.'),
});
export type GenerateProgressReportInput = z.infer<
  typeof GenerateProgressReportInputSchema
>;

const GenerateProgressReportOutputSchema = z.object({
  progressReport: z.string().describe('El informe de progreso generado.'),
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
