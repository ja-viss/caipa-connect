'use client';

import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import type { Area, Student, Teacher } from '@/lib/types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { DropdownMenuItem } from '../ui/dropdown-menu';

interface ExportAreasButtonProps {
  areas?: Area[];
  area?: Area;
  teachers: Teacher[];
  students: Student[];
  isMenuItem?: boolean;
}

export function ExportAreasButton({ areas, area, teachers, students, isMenuItem = false }: ExportAreasButtonProps) {
  
  const handleExportAll = () => {
    if (!areas) return;
    const doc = new jsPDF();
    doc.text('Listado de Todas las Áreas', 14, 16);

    const tableData = areas.map(a => {
        const areaTeachers = teachers.filter(t => a.teacherIds?.includes(t.id)).map(t => t.fullName).join(', ');
        const areaStudents = students.filter(s => a.studentIds?.includes(s.id)).map(s => s.name).join(', ');
        return [a.name, a.description, areaTeachers, areaStudents];
    });

    (doc as any).autoTable({
        head: [['Nombre', 'Descripción', 'Docentes', 'Estudiantes']],
        body: tableData,
        startY: 22,
    });
    doc.save('listado_de_areas.pdf');
  };

  const handleExportOne = () => {
    if (!area) return;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(area.name, 14, 22);
    doc.setFontSize(12);
    doc.text('Descripción:', 14, 32);
    const splitDescription = doc.splitTextToSize(area.description, 180);
    doc.text(splitDescription, 14, 38);

    const teachersData = teachers.map(t => [t.fullName, t.specialization]);
    if (teachersData.length > 0) {
        (doc as any).autoTable({
            head: [['Docentes Asignados', 'Especialización']],
            body: teachersData,
            startY: (doc as any).lastAutoTable.finalY + 15,
        });
    }

    const studentsData = students.map(s => [s.name, s.pedagogicalInfo.gradeLevel]);
     if (studentsData.length > 0) {
        (doc as any).autoTable({
            head: [['Estudiantes Asignados', 'Nivel']],
            body: studentsData,
            startY: (doc as any).lastAutoTable.finalY + 10,
        });
    }

    doc.save(`area_${area.name.replace(/\s/g, '_')}.pdf`);
  };

  const handleClick = area ? handleExportOne : handleExportAll;

  if (isMenuItem) {
    return (
      <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleClick(); }}>
        <FileText className="mr-2 h-4 w-4" />
        Exportar PDF
      </DropdownMenuItem>
    );
  }

  return (
    <Button onClick={handleClick} variant="outline">
      <Download className="mr-2 h-4 w-4" />
      Exportar a PDF
    </Button>
  );
}
