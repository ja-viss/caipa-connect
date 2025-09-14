import { getStudentByRepEmail } from '@/lib/actions/students';
import { getSession } from "@/lib/actions/users";
import { notFound, redirect } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, User, Phone, Home, Stethoscope, Pill, ShieldAlert, HeartPulse, GraduationCap, Lightbulb, Target } from 'lucide-react';
import type { Student } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { EditStudentDialog } from '@/components/student/edit-student-dialog';

export default async function RepresentativeStudentProfilePage() {
  const session = await getSession();
  if (!session?.user?.email) {
    redirect('/login');
  }

  const student: Student | null = await getStudentByRepEmail(session.user.email);
  
  if (!student) {
    notFound();
  }
  
  return (
    <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Perfil de Mi Estudiante</h1>
                <p className="text-muted-foreground">Información completa sobre {student.name}.</p>
            </div>
            <EditStudentDialog student={student} />
        </div>
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
        </div>
        <div className="lg:col-span-2 flex flex-col gap-8">
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
        </div>
    </div>
  );
}
