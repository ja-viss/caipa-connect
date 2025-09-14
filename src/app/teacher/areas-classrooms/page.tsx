'use client';
import { useEffect, useState } from 'react';
import type { Area, Classroom, Student, Teacher } from '@/lib/types';
import { getTeacherData } from '@/lib/actions/teachers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building, Calendar, Clock, Contact, Shapes, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function TeacherAreasClassroomsPage() {
  const [data, setData] = useState<{
    teacher: Teacher | null;
    assignedAreas: Area[];
    assignedClassrooms: Classroom[];
    assignedStudents: Student[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const result = await getTeacherData();
      if (result) {
        setData(result);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <Skeleton className="h-9 w-1/2" />
                <Skeleton className="h-5 w-3/4 mt-2" />
            </div>
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                <Card><CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
            </div>
        </div>
    )
  }

  if (!data || !data.teacher) {
    return <p>No se encontró información del docente.</p>;
  }

  const { assignedAreas, assignedClassrooms, assignedStudents } = data;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mis Áreas y Aulas</h1>
        <p className="text-muted-foreground">Información sobre tus áreas de especialización y aulas asignadas.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-1 xl:grid-cols-2">
        <Card className="xl:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shapes className="h-5 w-5" /> Áreas Asignadas ({assignedAreas.length})</CardTitle>
            </CardHeader>
            <CardContent>
                {assignedAreas.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                    {assignedAreas.map((area) => {
                        const studentsInArea = assignedStudents.filter(s => area.studentIds?.includes(s.id));
                        return (
                        <div key={area.id} className="p-4 border rounded-md bg-muted/50">
                            <h3 className="font-semibold">{area.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{area.description}</p>
                            <h4 className="text-xs font-semibold flex items-center gap-2">
                                <Users className="h-3 w-3" />
                                Estudiantes en esta Área ({studentsInArea.length})
                            </h4>
                            {studentsInArea.length > 0 ? (
                            <ul className="list-disc list-inside text-xs text-muted-foreground">
                                {studentsInArea.map(s => <li key={s.id}>{s.name}</li>)}
                            </ul>
                            ) : (
                            <p className="text-xs text-muted-foreground">No hay estudiantes asignados a esta área.</p>
                            )}
                        </div>
                        );
                    })}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No estás asignado a ninguna área.</p>
                )}
            </CardContent>
        </Card>

         <Card className="xl:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Building className="h-5 w-5" /> Aulas Asignadas ({assignedClassrooms.length})</CardTitle>
                 <CardDescription>Aulas donde impartes clases según el horario.</CardDescription>
            </CardHeader>
            <CardContent>
                 {assignedClassrooms.length > 0 ? (
                    <div className="space-y-4">
                        {assignedClassrooms.map((classroom) => {
                            const teacherScheduleInClassroom = classroom.schedule.filter(slot => {
                                const area = assignedAreas.find(a => a.id === slot.areaId);
                                return area?.teacherIds?.includes(data.teacher!.id);
                            });

                             if (teacherScheduleInClassroom.length === 0) return null;

                             return (
                                <div key={classroom.id} className="p-4 border rounded-md bg-muted/50">
                                    <h3 className="font-semibold">Aula {classroom.name} - {classroom.building}</h3>
                                     <div className="space-y-2 mt-2">
                                        {teacherScheduleInClassroom.map((slot) => (
                                        <div key={slot.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 bg-background rounded-md">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-sm">{assignedAreas.find(a => a.id === slot.areaId)?.name}</span>
                                                <span className="text-xs text-muted-foreground">{slot.day}</span>
                                            </div>
                                            <Badge variant="outline" className="mt-2 sm:mt-0">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {slot.startTime} - {slot.endTime}
                                            </Badge>
                                        </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                 ) : (
                    <p className="text-sm text-muted-foreground">No tienes aulas asignadas en tu horario.</p>
                 )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
