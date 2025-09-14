'use server';

/**
 * @fileOverview Un agente de IA para generar informes de evaluación de estudiantes.
 *
 * - generateEvaluationReport - Una función que genera un informe de evaluación.
 * - GenerateEvaluationReportInput - El tipo de entrada para la función.
 * - GenerateEvaluationReportOutput - El tipo de retorno para la función.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  GenerateEvaluationReportInputSchema,
  GenerateEvaluationReportOutputSchema,
} from '@/ai/schemas';

export type GenerateEvaluationReportInput = z.infer<typeof GenerateEvaluationReportInputSchema>;
export type GenerateEvaluationReportOutput = z.infer<typeof GenerateEvaluationReportOutputSchema>;

export async function generateEvaluationReport(
  input: GenerateEvaluationReportInput
): Promise<GenerateEvaluationReportOutput> {
  return generateEvaluationReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEvaluationReportPrompt',
  input: { schema: GenerateEvaluationReportInputSchema },
  output: { schema: GenerateEvaluationReportOutputSchema },
  prompt: `Eres un psicopedagogo experto en redactar informes de evaluación para niños con TDAH. Tu tarea es analizar los registros de actividad y crear un informe de evaluación estructurado.

Información del Estudiante:
- Nombre: {{{studentName}}}
- Área de Evaluación: {{{areaName}}}
- Período de Evaluación: Desde {{{startDate}}} hasta {{{endDate}}}

Registros de Actividad:
{{{activityLogs}}}

Basado en la información y los registros proporcionados, redacta un informe de evaluación que incluya los siguientes puntos:
1.  **Introducción:** Breve descripción del propósito del informe.
2.  **Análisis de Desempeño:** Resume los logros y avances del estudiante en el área de {{{areaName}}} durante el período.
3.  **Identificación de Desafíos:** Describe las dificultades y áreas de mejora observadas.
4.  **Observaciones Generales:** Comentarios adicionales sobre el comportamiento, la participación y la actitud del estudiante.
5.  **Recomendaciones:** Sugerencias concretas para padres y docentes para apoyar el desarrollo continuo del estudiante.

El tono debe ser profesional, objetivo y constructivo. El informe debe ser claro y fácil de entender para los padres.`,
});

const generateEvaluationReportFlow = ai.defineFlow(
  {
    name: 'generateEvaluationReportFlow',
    inputSchema: GenerateEvaluationReportInputSchema,
    outputSchema: GenerateEvaluationReportOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
