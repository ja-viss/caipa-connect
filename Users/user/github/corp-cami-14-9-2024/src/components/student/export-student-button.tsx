'use client';

import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import type { Student } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ExportStudentButtonProps {
  student: Student;
}

export function ExportStudentButton({ student }: ExportStudentButtonProps) {
  const handleExport = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`Perfil del Estudiante: ${student.name}`, 14, 22);
    doc.setFontSize(12);

    let yPos = 35;
    const sectionMargin = 10;

    const addSection = (title: string, data: [string, string][]) => {
      doc.setFontSize(14);
      doc.text(title, 14, yPos);
      yPos += 7;
      doc.setFontSize(11);
      data.forEach(([label, value]) => {
        const splitValue = doc.splitTextToSize(value, 150);
        doc.text(`${label}:`, 20, yPos);
        doc.text(splitValue, 65, yPos);
        yPos += (splitValue.length * 5) + 3;
      });
      yPos += sectionMargin - 3;
    };

    addSection('Información Básica', [
      ['Nombre Completo', student.name],
      ['Fecha de Nacimiento', format(new Date(student.dob), 'dd/MM/yyyy', { locale: es })],
      ['Género', student.gender],
    ]);
    
    addSection('Contacto de Emergencia', [
      ['Nombre', student.emergencyContact.name],
      ['Teléfono', student.emergencyContact.phone],
      ['Relación', student.emergencyContact.relation],
    ]);

    addSection('Información del Representante', [
        ['Nombre', student.representative.name],
        ['Relación', student.representative.relation],
        ['Teléfono', student.representative.phone],
        ['Email', student.representative.email],
        ['Dirección', student.representative.address || 'No especificada'],
    ]);

    doc.addPage();
    yPos = 25;

    addSection('Información Médica', [
      ['Diagnóstico', student.medicalInfo.diagnosis],
      ['Condiciones Adicionales', student.medicalInfo.conditions],
      ['Medicamentos', student.medicalInfo.medications],
      ['Alergias', student.medicalInfo.allergies],
    ]);

    addSection('Información Pedagógica', [
      ['Nivel/Grupo', `${student.pedagogicalInfo.gradeLevel} / ${student.pedagogicalInfo.specializationArea}`],
      ['Habilidades e Intereses', student.pedagogicalInfo.skillsAndInterests],
      ['Necesidades de Apoyo', student.pedagogicalInfo.supportNeeds],
    ]);

    doc.save(`perfil_${student.name.replace(/\s/g, '_')}.pdf`);
  };

  return (
    <Button onClick={handleExport} variant="outline">
      <Download className="mr-2 h-4 w-4" />
      Exportar Perfil a PDF
    </Button>
  );
}
