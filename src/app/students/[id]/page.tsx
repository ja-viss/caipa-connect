import { getStudentById, getActivityLogsByStudentId, getProgressReportsByStudentId } from '@/lib/actions/students';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Mail, User, Phone, Home, Stethoscope, Pill, ShieldAlert, HeartPulse, GraduationCap, Lightbulb, UserRound, Target } from 'lucide-react';
import ActivityLogger from '@/components/student/activity-logger';
import ProgressReportGenerator from '@/components/student/progress-report-generator';
import type { Student, ActivityLog, ProgressReport } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default async function StudentProfilePage({ params }: { params: { id: string } }) {
  const student: Student | null = await getStudentById(params.id);
  
  if (!student) {
    notFound();
  }
  
  const logs: ActivityLog[] = await getActivityLogsByStudentId(params.id);
  const reports: ProgressReport[] = await getProgressReportsByStudentId(params.id);


  const allLogsString = logs
    .map(
      (log) =>
        `Fecha: ${format(new Date(log.date), 'PPP', { locale: es })}\nProfesor(a): ${log.teacher}\nLogros: ${log.achievements}\nDesafíos: ${log.challenges}\nObservaciones: ${log.observations}\n---`
    )
    .join('\n\n');

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1 flex flex-col gap-8">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={student.avatar?.imageUrl} alt={student.name} data-ai-hint={student.avatar?.imageHint} />
              <AvatarFallback className="text-3xl">{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-2xl font-bold">{student.name}</h2>
              <p className="text-muted-foreground">Fecha de Nac.: {format(new Date(student.dob), 'dd/MM/yyyy', { locale: es })}</p>
              <p className="text-muted-foreground">Género: {student.gender}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información del Representante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
             <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold">{student.representative.name} ({student.representative.relation})</span>
              </div>
               <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <a href={`mailto:${student.representative.email}`} className="text-primary hover:underline">
                  {student.representative.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{student.representative.phone}</span>
              </div>
              {student.representative.address && (
                 <div className="flex items-start gap-2">
                  <Home className="w-4 h-4 text-muted-foreground mt-1" />
                  <span>{student.representative.address}</span>
                </div>
              )}
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Información Médica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                 <div className="flex items-start gap-2">
                    <Stethoscope className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                        <p className="font-semibold">Diagnóstico:</p>
                        <p>{student.medicalInfo.diagnosis}</p>
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <HeartPulse className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                        <p className="font-semibold">Condiciones Adicionales:</p>
                        <p>{student.medicalInfo.conditions}</p>
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <Pill className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                        <p className="font-semibold">Medicamentos:</p>
                        <p>{student.medicalInfo.medications}</p>
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                        <p className="font-semibold">Alergias:</p>
                        <p>{student.medicalInfo.allergies}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Información Pedagógica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                 <div className="flex items-start gap-2">
                    <GraduationCap className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                        <p className="font-semibold">Nivel/Grupo:</p>
                        <p>{student.pedagogicalInfo.gradeLevel} / {student.pedagogicalInfo.specializationArea}</p>
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                        <p className="font-semibold">Habilidades e Intereses:</p>
                        <p>{student.pedagogicalInfo.skillsAndInterests}</p>
                    </div>
                </div>
                 <div className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                        <p className="font-semibold">Necesidades de Apoyo:</p>
                        <p>{student.pedagogicalInfo.supportNeeds}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2 flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Registros de Actividad Diaria</CardTitle>
            <CardDescription>Registre logros, desafíos y observaciones.</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityLogger studentId={student.id} />
            <Separator className="my-6" />
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <div key={log.id} className="text-sm">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold">{log.teacher}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(log.date), 'PPP', { locale: es })}</p>
                    </div>
                    <p><strong>Logros:</strong> {log.achievements}</p>
                    <p><strong>Desafíos:</strong> {log.challenges}</p>
                    <p><strong>Observaciones:</strong> {log.observations}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No se encontraron registros de actividad.</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Informes de Progreso</CardTitle>
            <CardDescription>Genere y vea informes de progreso impulsados por IA.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressReportGenerator
              studentId={student.id}
              studentName={student.name}
              learningObjectives={student.pedagogicalInfo.supportNeeds}
              dailyActivityLogs={allLogsString}
            />
             <Separator className="my-6" />
             <div className="space-y-6">
                {reports.length > 0 ? (
                    reports.map(report => (
                        <div key={report.id}>
                            <p className="text-sm font-semibold text-muted-foreground mb-2">Informe del {format(new Date(report.date), 'PPP', { locale: es })}</p>
                            <div className="p-4 bg-muted/50 rounded-md text-sm whitespace-pre-wrap font-mono">
                                {report.content}
                            </div>
                        </div>
                    ))
                 ) : (
                    <p className="text-sm text-muted-foreground">No se han generado informes.</p>
                 )}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
