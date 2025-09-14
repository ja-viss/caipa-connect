'use server';

/**
 * @fileOverview Un agente de IA para redactar borradores de mensajes para anuncios escolares.
 *
 * - generateMessageDraft - Una función que genera un borrador de mensaje.
 * - GenerateMessageDraftInput - El tipo de entrada para la función generateMessageDraft.
 * - GenerateMessageDraftOutput - El tipo de retorno para la función generateMessageDraft.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  GenerateMessageDraftInputSchema,
  GenerateMessageDraftOutputSchema,
} from '@/ai/schemas';


export type GenerateMessageDraftInput = z.infer<
  typeof GenerateMessageDraftInputSchema
>;
export type GenerateMessageDraftOutput = z.infer<
  typeof GenerateMessageDraftOutputSchema
>;

export async function generateMessageDraft(
  input: GenerateMessageDraftInput
): Promise<GenerateMessageDraftOutput> {
  return generateMessageDraftFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMessageDraftPrompt',
  input: {schema: GenerateMessageDraftInputSchema},
  output: {schema: GenerateMessageDraftOutputSchema},
  prompt: `Eres un asistente de comunicación para una escuela especializada en niños con TDAH. Tu tarea es redactar mensajes claros, concisos y empáticos para los padres y docentes.

  Tema del Mensaje: {{{topic}}}

  Genera un asunto apropiado y un cuerpo de mensaje basado en el tema proporcionado. El tono debe ser profesional, informativo y de apoyo.`,
});

const generateMessageDraftFlow = ai.defineFlow(
  {
    name: 'generateMessageDraftFlow',
    inputSchema: GenerateMessageDraftInputSchema,
    outputSchema: GenerateMessageDraftOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
