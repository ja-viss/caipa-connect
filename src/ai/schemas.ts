/**
 * @fileOverview Esquemas Zod compartidos para los flujos de IA.
 * Este archivo centraliza las definiciones de esquemas para evitar errores de exportación en archivos 'use server'.
 */

import { z } from 'zod';

// Esquemas para generate-evaluation-report.ts
export const GenerateEvaluationReportInputSchema = z.object({
  studentName: z.string().describe('El nombre del estudiante.'),
  areaName: z.string().describe('El área de especialización que se está evaluando.'),
  startDate: z.string().describe('La fecha de inicio del período de evaluación (formato YYYY-MM-DD).'),
  endDate: z.string().describe('La fecha de fin del período de evaluación (formato YYYY-MM-DD).'),
  activityLogs: z.string().describe('Una cadena de texto con los registros de actividad del estudiante durante el período seleccionado.'),
});

export const GenerateEvaluationReportOutputSchema = z.object({
  report: z.string().describe('El informe de evaluación generado.'),
});

// Esquemas para generate-message-draft.ts
export const GenerateMessageDraftInputSchema = z.object({
  topic: z.string().describe('El tema o idea principal del mensaje que se va a generar.'),
});

export const GenerateMessageDraftOutputSchema = z.object({
  subject: z.string().describe('El asunto generado para el mensaje.'),
  body: z.string().describe('El cuerpo del mensaje generado.'),
});

// Esquemas para generate-progress-report.ts
export const GenerateProgressReportInputSchema = z.object({
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

export const GenerateProgressReportOutputSchema = z.object({
  progressReport: z.string().describe('El informe de progreso generado.'),
});
