import Link from "next/link";
import { getStudents } from "@/lib/actions/students";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Pencil } from "lucide-react";
import type { Student } from "@/lib/types";
import { AddStudentDialog } from "@/components/student/add-student-dialog";
import { DeleteStudentAlert } from "@/components/student/delete-student-alert";
import { EditStudentDialog } from "@/components/student/edit-student-dialog";
import { ExportStudentsButton } from "@/components/student/export-students-button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default async function StudentsPage() {
  const students: Student[] = await getStudents();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-foreground">Estudiantes</h1>
            <p className="text-muted-foreground">Gestionar y ver perfiles de estudiantes.</p>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-22rem)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    <span className="sr-only">Avatar</span>
                  </TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Representante</TableHead>
                  <TableHead className="hidden md:table-cell">Grupo</TableHead>
                  <TableHead>
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={student.avatar?.imageUrl} alt={student.name} data-ai-hint={student.avatar?.imageHint} />
                        <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/students/${student.id}`} className="hover:underline">
                        {student.name}
                      </Link>
                    </TableCell>
                    <TableCell>{student.representative.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{student.pedagogicalInfo.specializationArea}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menú de acciones</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/students/${student.id}`} className="flex items-center cursor-pointer">
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver Perfil
                              </Link>
                          </DropdownMenuItem>
                          <EditStudentDialog student={student} asDropdownItem={true} />
                          <DropdownMenuSeparator />
                          <DeleteStudentAlert studentId={student.id} />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
      
      <div className="flex justify-end gap-2">
        <ExportStudentsButton students={students} />
        <AddStudentDialog />
      </div>
    </div>
  );
}
