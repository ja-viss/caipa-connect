'use client';

import { useEffect, useState } from 'react';
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
import { Loader2, Sparkles, Save, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleGenerateEvaluationReport, saveEvaluationReport } from '../actions';
import { getStudents, getEvaluationReportsByStudentId } from '@/lib/actions/students';
import type { Student, ProgressReport } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const reportSchema = z.object({
  studentId: z.string().min(1, 'Debes seleccionar un estudiante.'),
  title: z.string().min(1, 'Debes proporcionar un título.'),
  draft: z.string().min(10, 'El borrador debe tener al menos 10 caracteres.'),
});

type ReportFormValues = z.infer<typeof reportSchema>;

export default function ReportGeneratorPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const { toast } = useToast();

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
  });

  useEffect(() => {
    getStudents().then(setStudents);
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      getEvaluationReportsByStudentId(selectedStudentId).then(setReports);
    } else {
      setReports([]);
    }
  }, [selectedStudentId]);

  const onSubmit = async (data: ReportFormValues, useAi: boolean) => {
    setIsLoading(true);

    let finalReportContent = data.draft;

    try {
      if (useAi) {
        const result = await handleGenerateEvaluationReport({
          title: data.title,
          draft: data.draft,
        });

        if (!result.success || !result.report) {
          toast({ title: 'Error de IA', description: result.error || 'No se pudo procesar el borrador con la IA.', variant: 'destructive' });
          setIsLoading(false);
          return;
        }
        finalReportContent = result.report;
      }

      const saveResult = await saveEvaluationReport({
        studentId: data.studentId,
        content: `${data.title}\n\n${finalReportContent}`,
      });

      if (saveResult.success) {
        toast({ title: 'Informe Guardado', description: 'El informe ha sido guardado exitosamente.' });
        form.reset({ studentId: data.studentId, title: '', draft: '' });
        if (selectedStudentId) {
          getEvaluationReportsByStudentId(selectedStudentId).then(setReports);
        }
      } else {
        toast({ title: 'Error al Guardar', description: saveResult.error || 'No se pudo guardar el informe.', variant: 'destructive' });
      }

    } catch (error) {
      toast({ title: 'Error Inesperado', description: 'Ocurrió un error al procesar el informe.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Redacción de Informes de Evaluación</h1>
        <p className="text-muted-foreground">
          Selecciona un estudiante, escribe un informe y guárdalo directamente o mejóralo con IA.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <form>
            <CardHeader>
              <CardTitle>Redactar Informe</CardTitle>
              <CardDescription>
                Completa los detalles para generar y guardar el informe.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="studentId">Estudiante</Label>
                 <Select 
                    onValueChange={(value) => {
                      form.setValue('studentId', value);
                      setSelectedStudentId(value);
                    }}
                    defaultValue={form.getValues('studentId')}
                 >
                    <SelectTrigger id="studentId">
                        <SelectValue placeholder="Selecciona un estudiante..." />
                    </SelectTrigger>
                    <SelectContent>
                        {students.map(student => (
                            <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {form.formState.errors.studentId && <p className="text-sm text-destructive mt-1">{form.formState.errors.studentId.message}</p>}
              </div>
              <div>
                <Label htmlFor="title">Título del Informe</Label>
                <Input
                  id="title"
                  placeholder="Ej: Evaluación Psicopedagógica"
                  {...form.register('title')}
                />
                {form.formState.errors.title && <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>}
              </div>
              <div>
                <Label htmlFor="draft">Contenido del Informe</Label>
                <Textarea
                  id="draft"
                  placeholder="Escribe aquí el contenido del informe..."
                  rows={12}
                  {...form.register('draft')}
                />
                 {form.formState.errors.draft && <p className="text-sm text-destructive mt-1">{form.formState.errors.draft.message}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
              <Button type="button" onClick={form.handleSubmit(data => onSubmit(data, false))} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Guardar Informe Manualmente
              </Button>
               <Button type="button" onClick={form.handleSubmit(data => onSubmit(data, true))} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Mejorar con IA y Guardar
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Informes Guardados</CardTitle>
            <CardDescription>
              Historial de informes de evaluación para el estudiante seleccionado.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex">
            {selectedStudentId ? (
                reports.length > 0 ? (
                    <div className="w-full space-y-4 max-h-96 overflow-y-auto pr-2">
                        {reports.map(report => (
                             <div key={report.id}>
                                <p className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Informe del {format(new Date(report.date), 'PPP', { locale: es })}
                                </p>
                                <div className="p-4 bg-muted/50 rounded-md text-sm whitespace-pre-wrap font-mono border max-h-60 overflow-y-auto">
                                    {report.content}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                     <div className="w-full flex items-center justify-center text-center p-8 bg-muted/50 rounded-md">
                        <p className="text-muted-foreground">
                          No hay informes guardados para este estudiante.
                        </p>
                    </div>
                )
            ) : (
              <div className="w-full flex items-center justify-center text-center p-8 bg-muted/50 rounded-md">
                <p className="text-muted-foreground">
                  Selecciona un estudiante para ver sus informes.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
