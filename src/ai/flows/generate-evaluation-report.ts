'use server';

/**
 * @fileOverview Un agente de IA para mejorar la redacción de informes de evaluación de estudiantes.
 *
 * - generateEvaluationReport - Una función que mejora un borrador de informe de evaluación.
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
  prompt: `Eres un psicopedagogo experto y un excelente redactor. Tu tarea es revisar y mejorar un borrador de informe de evaluación para un estudiante.

Título del Informe Original:
{{{title}}}

Borrador del Informe:
{{{draft}}}

Por favor, revisa el borrador proporcionado y mejóralo. Concéntrate en los siguientes puntos:
1.  **Claridad y Coherencia:** Asegúrate de que las ideas estén expresadas de forma clara y lógica.
2.  **Tono Profesional:** Ajusta el lenguaje para que sea objetivo, constructivo y apropiado para un informe dirigido a padres y docentes.
3.  **Gramática y Ortografía:** Corrige cualquier error gramatical o de ortografía.
4.  **Estructura:** Si es necesario, reestructura las oraciones o párrafos para mejorar el flujo del informe.
5.  **Consistencia:** Mantén el título original del informe.

Devuelve una versión mejorada y pulida del informe en el campo 'report'. No inventes información nueva; trabaja únicamente con el contenido del borrador proporcionado.`,
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
