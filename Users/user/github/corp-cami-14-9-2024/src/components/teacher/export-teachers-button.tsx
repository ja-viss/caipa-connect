'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import type { Teacher } from '@/lib/types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ExportTeachersButtonProps {
  teachers: Teacher[];
}

export function ExportTeachersButton({ teachers }: ExportTeachersButtonProps) {
  const handleExport = () => {
    const doc = new jsPDF();
    doc.text('Listado de Docentes', 14, 16);

    const tableData = teachers.map(teacher => [
      teacher.fullName,
      teacher.ci,
      teacher.email,
      teacher.phone,
      teacher.specialization,
    ]);

    (doc as any).autoTable({
      head: [['Nombre Completo', 'Cédula', 'Email', 'Teléfono', 'Especialización']],
      body: tableData,
      startY: 22,
    });

    doc.save('listado_de_docentes.pdf');
  };

  return (
    <Button onClick={handleExport} variant="outline">
      <Download className="mr-2 h-4 w-4" />
      Exportar a PDF
    </Button>
  );
}
