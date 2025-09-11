'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { handleGenerateReport } from '@/app/actions';
import { Loader2 } from 'lucide-react';
import type { GenerateProgressReportInput } from '@/ai/flows/generate-progress-report';

interface ProgressReportGeneratorProps {
  studentName: string;
  learningObjectives: string;
  dailyActivityLogs: string;
}

export default function ProgressReportGenerator({
  studentName,
  learningObjectives,
  dailyActivityLogs,
}: ProgressReportGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
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
        description: 'El informe de progreso ha sido generado exitosamente.',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'No se pudo generar el informe.',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleGenerate} disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generando...
          </>
        ) : (
          'Generar Informe de Progreso con IA'
        )}
      </Button>

      {report && (
        <div>
          <h4 className="font-semibold mb-2">Borrador del Informe Generado:</h4>
          <div className="p-4 bg-muted/50 rounded-md text-sm whitespace-pre-wrap font-mono border">
            {report}
          </div>
          <div className="flex gap-2 mt-4">
            <Button size="sm">Guardar Informe</Button>
            <Button size="sm" variant="outline">
              Copiar Texto
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
