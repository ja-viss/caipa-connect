'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import type { Student } from '@/lib/types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ExportStudentsButtonProps {
  students: Student[];
}

export function ExportStudentsButton({ students }: ExportStudentsButtonProps) {
  const handleExport = () => {
    const doc = new jsPDF();
    doc.text('Listado de Estudiantes', 14, 16);

    const tableData = students.map(student => [
      student.name,
      format(new Date(student.dob), 'dd/MM/yyyy', { locale: es }),
      student.pedagogicalInfo.gradeLevel,
      student.representative.name,
      student.representative.phone,
    ]);

    (doc as any).autoTable({
      head: [['Nombre', 'Fecha de Nac.', 'Nivel', 'Representante', 'Teléfono Rep.']],
      body: tableData,
      startY: 22,
    });

    doc.save('listado_de_estudiantes.pdf');
  };

  return (
    <Button onClick={handleExport} variant="outline">
      <Download className="mr-2 h-4 w-4" />
      Exportar a PDF
    </Button>
  );
}
