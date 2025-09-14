'use client';

import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { getStudents, getActivityLogsForReport } from '@/lib/actions/students';
import { getAreas } from '@/lib/actions/areas';
import type { Student, Area } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { handleGenerateEvaluationReport } from '../actions';

const reportSchema = z.object({
  studentId: z.string().min(1, 'Debes seleccionar un estudiante.'),
  areaId: z.string().min(1, 'Debes seleccionar un área.'),
});

type ReportFormValues = z.infer<typeof reportSchema>;

export default function ReportGeneratorPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [studentsData, areasData] = await Promise.all([
        getStudents(),
        getAreas(),
      ]);
      setStudents(studentsData);
      setAreas(areasData);
      setLoading(false);
    }
    loadData();
  }, []);

  const onSubmit = async (data: ReportFormValues) => {
    if (!date?.from || !date?.to) {
      toast({
        title: 'Error de validación',
        description: 'Por favor, selecciona un rango de fechas.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedReport(null);

    try {
      const selectedStudent = students.find((s) => s.id === data.studentId);
      const selectedArea = areas.find((a) => a.id === data.areaId);

      if (!selectedStudent || !selectedArea) {
        toast({ title: 'Error', description: 'Estudiante o área no encontrados.', variant: 'destructive'});
        setIsGenerating(false);
        return;
      }
      
      const activityLogs = await getActivityLogsForReport(
        data.studentId,
        format(date.from, 'yyyy-MM-dd'),
        format(date.to, 'yyyy-MM-dd')
      );
      
      const logsString = activityLogs.map(log => 
        `Fecha: ${format(new Date(log.date), 'PPP', { locale: es })}\nProfesor(a): ${log.teacher}\nLogros: ${log.achievements}\nDesafíos: ${log.challenges}\nObservaciones: ${log.observations}`
      ).join('\n---\n');

      const result = await handleGenerateEvaluationReport({
        studentName: selectedStudent.name,
        areaName: selectedArea.name,
        startDate: format(date.from, 'yyyy-MM-dd'),
        endDate: format(date.to, 'yyyy-MM-dd'),
        activityLogs: logsString,
      });

      if (result.success && result.report) {
        setGeneratedReport(result.report);
        toast({ title: 'Informe Generado', description: 'El informe de evaluación ha sido generado exitosamente.' });
      } else {
        toast({ title: 'Error', description: result.error || 'No se pudo generar el informe.', variant: 'destructive' });
      }

    } catch (error) {
      toast({ title: 'Error Inesperado', description: 'Ocurrió un error al generar el informe.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Generador de Informes con IA</h1>
        <p className="text-muted-foreground">
          Crea informes de evaluación detallados para los estudiantes.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configuración del Informe</CardTitle>
            <CardDescription>
              Selecciona el estudiante, el área y el período de evaluación.
            </CardDescription>
          </CardHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="studentId">Estudiante</Label>
                   <Select onValueChange={(value) => form.setValue('studentId', value)} disabled={loading}>
                        <SelectTrigger id="studentId"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                        <SelectContent>
                            {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                   </Select>
                   {form.formState.errors.studentId && <p className="text-sm text-destructive mt-1">{form.formState.errors.studentId.message}</p>}
                </div>
                 <div>
                  <Label htmlFor="areaId">Área de Evaluación</Label>
                  <Select onValueChange={(value) => form.setValue('areaId', value)} disabled={loading}>
                        <SelectTrigger id="areaId"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                        <SelectContent>
                            {areas.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                        </SelectContent>
                   </Select>
                   {form.formState.errors.areaId && <p className="text-sm text-destructive mt-1">{form.formState.errors.areaId.message}</p>}
                </div>
              </div>
              <div>
                <Label>Período de Evaluación</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, 'LLL dd, y', { locale: es })} -{' '}
                            {format(date.to, 'LLL dd, y', { locale: es })}
                          </>
                        ) : (
                          format(date.from, 'LLL dd, y', { locale: es })
                        )
                      ) : (
                        <span>Selecciona un rango de fechas</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isGenerating || loading}>
                {isGenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generar Informe
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Informe Generado</CardTitle>
            <CardDescription>
              Aquí aparecerá el informe generado por la IA.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex">
            {isGenerating ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-muted/50 rounded-md">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Generando informe...</p>
                    <p className="text-sm text-muted-foreground/80">Esto puede tomar unos segundos.</p>
                </div>
            ) : generatedReport ? (
              <div className="w-full space-y-4">
                <div className="p-4 bg-muted/50 rounded-md text-sm whitespace-pre-wrap font-mono border h-96 overflow-y-auto">
                    {generatedReport}
                </div>
                 <Button size="sm" variant="outline" onClick={() => {
                    navigator.clipboard.writeText(generatedReport);
                    toast({ title: 'Copiado', description: 'El informe se ha copiado al portapapeles.' });
                 }}>
                    Copiar Informe
                </Button>
              </div>
            ) : (
              <div className="w-full flex items-center justify-center text-center p-8 bg-muted/50 rounded-md">
                <p className="text-muted-foreground">
                  El informe aparecerá aquí una vez generado.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
