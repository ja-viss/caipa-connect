
import { getTeachers } from "@/lib/actions/teachers";
import type { Teacher } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { AddTeacherDialog } from "@/components/teacher/add-teacher-dialog";
import { DeleteTeacherAlert } from "@/components/teacher/delete-teacher-alert";
import { EditTeacherDialog } from "@/components/teacher/edit-teacher-dialog";
import { ExportTeachersButton } from "@/components/teacher/export-teachers-button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default async function TeacherManagementPage() {
  const teachers: Teacher[] = await getTeachers();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Docentes</h1>
          <p className="text-muted-foreground">Administrar perfiles de docentes y asignaciones a áreas.</p>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-22rem)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Cédula</TableHead>
                  <TableHead>Correo Electrónico</TableHead>
                  <TableHead className="hidden md:table-cell">Especialización</TableHead>
                  <TableHead>
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">{teacher.fullName}</TableCell>
                    <TableCell>{teacher.ci}</TableCell>
                    <TableCell>{teacher.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{teacher.specialization}</TableCell>
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
                          <EditTeacherDialog teacher={teacher} />
                          <DeleteTeacherAlert teacherId={teacher.id} />
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
        <ExportTeachersButton teachers={teachers} />
        <AddTeacherDialog />
      </div>
    </div>
  );
}
