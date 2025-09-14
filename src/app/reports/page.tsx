'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleGenerateEvaluationReport } from '../actions';

const reportSchema = z.object({
  title: z.string().min(1, 'Debes proporcionar un título.'),
  draft: z.string().min(10, 'El borrador debe tener al menos 10 caracteres.'),
});

type ReportFormValues = z.infer<typeof reportSchema>;

export default function ReportGeneratorPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
  });

  const onSubmit = async (data: ReportFormValues) => {
    setIsGenerating(true);
    setGeneratedReport(null);

    try {
      const result = await handleGenerateEvaluationReport({
        title: data.title,
        draft: data.draft,
      });

      if (result.success && result.report) {
        setGeneratedReport(result.report);
        toast({ title: 'Redacción Mejorada', description: 'La IA ha mejorado tu borrador exitosamente.' });
      } else {
        toast({ title: 'Error', description: result.error || 'No se pudo procesar el borrador.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error Inesperado', description: 'Ocurrió un error al procesar el borrador.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Asistente de Redacción de Informes con IA</h1>
        <p className="text-muted-foreground">
          Escribe un borrador del informe y la IA mejorará la redacción por ti.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Borrador del Informe</CardTitle>
            <CardDescription>
              Introduce un título y el contenido del informe que deseas mejorar.
            </CardDescription>
          </CardHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título del Informe</Label>
                <Input
                  id="title"
                  placeholder="Ej: Informe de Progreso - Matemáticas"
                  {...form.register('title')}
                />
                {form.formState.errors.title && <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>}
              </div>
              <div>
                <Label htmlFor="draft">Borrador del Informe</Label>
                <Textarea
                  id="draft"
                  placeholder="Escribe aquí el contenido del informe..."
                  rows={12}
                  {...form.register('draft')}
                />
                 {form.formState.errors.draft && <p className="text-sm text-destructive mt-1">{form.formState.errors.draft.message}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isGenerating}>
                {isGenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Mejorar Redacción
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Informe Mejorado</CardTitle>
            <CardDescription>
              Aquí aparecerá la versión del informe mejorada por la IA.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex">
            {isGenerating ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-muted/50 rounded-md">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Mejorando redacción...</p>
                    <p className="text-sm text-muted-foreground/80">Esto puede tomar unos segundos.</p>
                </div>
            ) : generatedReport ? (
              <div className="w-full space-y-4">
                <div className="p-4 bg-muted/50 rounded-md text-sm whitespace-pre-wrap font-mono border h-96 overflow-y-auto">
                    {generatedReport}
                </div>
                 <Button size="sm" variant="outline" onClick={() => {
                    navigator.clipboard.writeText(generatedReport);
                    toast({ title: 'Copiado', description: 'El informe mejorado se ha copiado al portapapeles.' });
                 }}>
                    Copiar Informe
                </Button>
              </div>
            ) : (
              <div className="w-full flex items-center justify-center text-center p-8 bg-muted/50 rounded-md">
                <p className="text-muted-foreground">
                  El informe mejorado aparecerá aquí.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
