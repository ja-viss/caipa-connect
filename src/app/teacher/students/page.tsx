'use client';
import { useEffect, useState } from 'react';
import type { Student, Teacher } from '@/lib/types';
import { getTeacherData } from '@/lib/actions/teachers';
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Eye, Search } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { StudentProfileDialog } from '@/components/student/student-profile-dialog';

export default function TeacherStudentsPage() {
  const [data, setData] = useState<{ teacher: Teacher | null, assignedStudents: Student[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchData() {
      const result = await getTeacherData();
      if (result) {
        setData({ teacher: result.teacher, assignedStudents: result.assignedStudents });
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredStudents = data?.assignedStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <Skeleton className="h-9 w-1/3" />
          <Skeleton className="h-5 w-2/3 mt-2" />
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data || !data.teacher) {
    return <p>No se encontró información del docente.</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-foreground">Mis Estudiantes</h1>
            <p className="text-muted-foreground">Gestiona y visualiza los perfiles de tus estudiantes asignados.</p>
        </div>
         <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Buscar estudiante..."
                className="pl-8 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Avatar</span>
                </TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Representante</TableHead>
                <TableHead className="hidden md:table-cell">Grupo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={student.avatar?.imageUrl} alt={student.name} data-ai-hint={student.avatar?.imageHint} />
                        <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      {student.name}
                    </TableCell>
                    <TableCell>{student.representative.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{student.pedagogicalInfo.specializationArea}</TableCell>
                    <TableCell className="text-right">
                      <StudentProfileDialog student={student} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No se encontraron estudiantes.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
