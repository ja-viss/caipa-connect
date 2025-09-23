
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Mail, User, Phone, Home, Stethoscope, Pill, ShieldAlert, HeartPulse, GraduationCap, Lightbulb, Target } from 'lucide-react';
import type { Student } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface StudentProfileDialogProps {
  student: Student;
}

export function StudentProfileDialog({ student }: StudentProfileDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="mr-2 h-4 w-4" />
          Ver Perfil
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl p-0">
        <ScrollArea className="max-h-[85vh]">
          <div className="p-6">
            <DialogHeader className="mb-6">
              <div className="flex items-center gap-4">
                 <Avatar className="h-20 w-20">
                    <AvatarImage src={student.avatarUrl} alt={student.name} />
                    <AvatarFallback className="text-3xl">{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                    <DialogTitle className="text-3xl font-bold">{student.name}</DialogTitle>
                    <DialogDescription>
                        Información detallada del estudiante.
                    </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            <Tabs defaultValue="student-info" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
                <TabsTrigger value="student-info">Estudiante</TabsTrigger>
                <TabsTrigger value="medical-info">Info. Médica</TabsTrigger>
                <TabsTrigger value="pedagogical-info">Info. Pedagógica</TabsTrigger>
                <TabsTrigger value="representative-info">Representante</TabsTrigger>
              </TabsList>

              <div className="mt-4 p-1">
                <TabsContent value="student-info" className="space-y-4">
                  <Card>
                    <CardHeader><CardTitle>Información Básica</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><strong>Fecha de Nacimiento:</strong> {format(new Date(student.dob), 'dd/MM/yyyy', { locale: es })}</p>
                        <p><strong>Género:</strong> {student.gender}</p>
                    </CardContent>
                  </Card>
                  <Card>
                     <CardHeader><CardTitle>Contacto de Emergencia</CardTitle></CardHeader>
                     <CardContent className="space-y-2 text-sm">
                        <p><strong>Nombre:</strong> {student.emergencyContact.name}</p>
                        <p><strong>Teléfono:</strong> {student.emergencyContact.phone}</p>
                        <p><strong>Relación:</strong> {student.emergencyContact.relation}</p>
                     </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="medical-info" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Stethoscope className="h-5 w-5" />Diagnóstico</CardTitle></CardHeader>
                        <CardContent><p>{student.medicalInfo.diagnosis}</p></CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><HeartPulse className="h-5 w-5" />Condiciones Adicionales</CardTitle></CardHeader>
                        <CardContent><p>{student.medicalInfo.conditions}</p></CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Pill className="h-5 w-5" />Medicamentos</CardTitle></CardHeader>
                        <CardContent><p>{student.medicalInfo.medications}</p></CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5" />Alergias</CardTitle></CardHeader>
                        <CardContent><p>{student.medicalInfo.allergies}</p></CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pedagogical-info" className="space-y-4">
                     <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" />Nivel y Grupo</CardTitle></CardHeader>
                        <CardContent><p>{student.pedagogicalInfo.gradeLevel} / {student.pedagogicalInfo.specializationArea}</p></CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5" />Habilidades e Intereses</CardTitle></CardHeader>
                        <CardContent><p>{student.pedagogicalInfo.skillsAndInterests}</p></CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />Necesidades de Apoyo</CardTitle></CardHeader>
                        <CardContent><p>{student.pedagogicalInfo.supportNeeds}</p></CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="representative-info">
                   <Card>
                        <CardHeader><CardTitle>Información del Representante</CardTitle></CardHeader>
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
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
