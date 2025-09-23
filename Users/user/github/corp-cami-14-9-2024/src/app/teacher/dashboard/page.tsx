'use client';

import { useEffect, useState } from 'react';
import type { Area, Classroom, Student, Teacher, ActivityLog } from '@/lib/types';
import { getTeacherDataWithLogs } from '@/lib/actions/teachers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Shapes, Building, UserCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

export default function TeacherDashboard() {
  const [data, setData] = useState<{
    teacher: Teacher | null;
    assignedAreas: Area[];
    assignedClassrooms: Classroom[];
    assignedStudents: Student[];
    recentLogs: ActivityLog[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const result = await getTeacherDataWithLogs();
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
         <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div>
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-5 w-80 mt-2" />
            </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-10 w-1/4" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-10 w-1/4" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-10 w-1/4" /></CardContent></Card>
        </div>
         <Card>
            <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </CardContent>
        </Card>
      </div>
    );
  }

  if (!data || !data.teacher) {
    return (
        <div className="flex items-center justify-center h-full">
            <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <CardTitle>No se encontró información del docente</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        No pudimos encontrar un perfil de docente asociado a tu cuenta. Por favor, contacta a la administración.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
  }

  const { teacher, assignedAreas, assignedClassrooms, assignedStudents, recentLogs } = data;

  const logSummary = recentLogs.reduce((acc, log) => {
    acc.achievements += log.achievements.split(/\s+/).length; // Count words
    acc.challenges += log.challenges.split(/\s+/).length;
    return acc;
  }, { achievements: 0, challenges: 0 });

  const chartData = [
    { name: 'Logros', count: logSummary.achievements, fill: 'hsl(var(--chart-1))' },
    { name: 'Desafíos', count: logSummary.challenges, fill: 'hsl(var(--chart-2))' },
  ];

  return (
    <div className="flex flex-col gap-8">
        <div>
            <h1 className="text-3xl font-bold text-foreground">Panel de Docente</h1>
            <p className="text-muted-foreground">Bienvenido/a, {teacher.fullName}. Aquí tienes un resumen de tus asignaciones.</p>
        </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Estudiantes Asignados
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedStudents.length}</div>
            <p className="text-xs text-muted-foreground">
              estudiantes en tus áreas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Áreas Asignadas
            </CardTitle>
            <Shapes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedAreas.length}</div>
            <p className="text-xs text-muted-foreground">
              áreas de especialización
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aulas Asignadas
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedClassrooms.length}</div>
            <p className="text-xs text-muted-foreground">
              aulas en tu horario
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
         <Card>
            <CardHeader>
              <CardTitle>Resumen de Actividad Reciente</CardTitle>
              <CardDescription>Resumen de palabras en logros y desafíos de los últimos 7 días.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{}} className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="count" radius={4} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
          </Card>

         <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Acceso Rápido a Estudiantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {assignedStudents.length > 0 ? (
                  assignedStudents.map((student) => (
                    <Link href={`/students/${student.id}`} key={student.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md hover:bg-muted transition-colors">
                       <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                              <AvatarImage src={student.avatar?.imageUrl} alt={student.name} data-ai-hint={student.avatar?.imageHint} />
                              <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                              <p className="font-semibold">{student.name}</p>
                              <p className="text-sm text-muted-foreground">Grupo: {student.pedagogicalInfo.specializationArea}</p>
                          </div>
                      </div>
                      <Badge variant="outline">Ver Perfil</Badge>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No tienes estudiantes asignados.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
