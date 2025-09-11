'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { handleGenerateReport } from '@/app/actions';
import { Loader2 } from 'lucide-react';
import type { GenerateProgressReportInput } from '@/ai/flows/generate-progress-report';
import { createProgressReport } from '@/lib/actions/students';

interface ProgressReportGeneratorProps {
  studentId: string;
  studentName: string;
  learningObjectives: string;
  dailyActivityLogs: string;
}

export default function ProgressReportGenerator({
  studentId,
  studentName,
  learningObjectives,
  dailyActivityLogs,
}: ProgressReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    setReport(null);

    const input: GenerateProgressReportInput = {
      studentName,
      learningObjectives,
      dailyActivityLogs,
    };

    const result = await handleGenerateReport(input);

    if (result.success) {
      setReport(result.report);
      toast({
        title: 'Informe Generado',
        description: 'El borrador del informe de progreso ha sido generado.',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'No se pudo generar el informe.',
        variant: 'destructive',
      });
    }

    setIsGenerating(false);
  };
  
  const handleSaveReport = async () => {
    if (!report) return;

    setIsSaving(true);
    const result = await createProgressReport({
        studentId,
        content: report,
    });

    if (result.success) {
        toast({
            title: 'Informe Guardado',
            description: 'El informe de progreso se ha guardado correctamente.',
        });
        setReport(null);
    } else {
        toast({
            title: 'Error',
            description: result.error || 'No se pudo guardar el informe.',
            variant: 'destructive',
        });
    }
    setIsSaving(false);
  }

  return (
    <div className="space-y-4">
      <Button onClick={handleGenerate} disabled={isGenerating || dailyActivityLogs.trim() === ''}>
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generando...
          </>
        ) : (
          'Generar Informe de Progreso con IA'
        )}
      </Button>
      {dailyActivityLogs.trim() === '' && <p className="text-xs text-muted-foreground">Se necesita al menos un registro de actividad para generar un informe.</p>}


      {report && (
        <div>
          <h4 className="font-semibold mb-2">Borrador del Informe Generado:</h4>
          <div className="p-4 bg-muted/50 rounded-md text-sm whitespace-pre-wrap font-mono border">
            {report}
          </div>
          <div className="flex gap-2 mt-4">
            <Button size="sm" onClick={handleSaveReport} disabled={isSaving}>
                 {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Informe
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(report)}>
              Copiar Texto
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
