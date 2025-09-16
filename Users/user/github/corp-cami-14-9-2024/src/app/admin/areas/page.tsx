import { getAreas } from "@/lib/actions/areas";
import { getStudents } from "@/lib/actions/students";
import { getTeachers } from "@/lib/actions/teachers";
import type { Area, Student, Teacher } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Users, Contact, Trash2, Pencil } from "lucide-react";
import { AddAreaDialog } from "@/components/area/add-area-dialog";
import { DeleteAreaAlert } from "@/components/area/delete-area-alert";
import { EditAreaDialog } from "@/components/area/edit-area-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExportAreasButton } from "@/components/area/export-areas-button";

export default async function AreaManagementPage() {
  const areas: Area[] = await getAreas();
  const allTeachers: Teacher[] = await getTeachers();
  const allStudents: Student[] = await getStudents();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Áreas</h1>
          <p className="text-muted-foreground">Crear y administrar áreas de especialización.</p>
        </div>
        <div className="flex gap-2">
          <ExportAreasButton areas={areas} teachers={allTeachers} students={allStudents} />
          <AddAreaDialog teachers={allTeachers} students={allStudents} />
        </div>
      </div>
      
      {areas.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {areas.map((area) => {
            const assignedTeachers = allTeachers.filter(t => area.teacherIds?.includes(t.id));
            const assignedStudents = allStudents.filter(s => area.studentIds?.includes(s.id));

            return (
              <Card key={area.id} className="flex flex-col">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle>{area.name}</CardTitle>
                    <CardDescription>{area.description}</CardDescription>
                  </div>
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <EditAreaDialog area={area} allTeachers={allTeachers} allStudents={allStudents} />
                      <ExportAreasButton area={area} teachers={assignedTeachers} students={assignedStudents} isMenuItem />
                      <DeleteAreaAlert areaId={area.id} />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                      <Contact className="h-4 w-4" />
                      Docentes Asignados ({assignedTeachers.length})
                    </h4>
                    {assignedTeachers.length > 0 ? (
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {assignedTeachers.map(t => <li key={t.id}>{t.fullName}</li>)}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No hay docentes asignados.</p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4" />
                      Estudiantes Asignados ({assignedStudents.length})
                    </h4>
                     {assignedStudents.length > 0 ? (
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {assignedStudents.map(s => <li key={s.id}>{s.name}</li>)}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No hay estudiantes asignados.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="flex items-center justify-center py-20">
            <CardContent className="text-center">
                <h3 className="text-xl font-semibold">No se encontraron áreas</h3>
                <p className="text-muted-foreground">Crea tu primera área para empezar a organizar.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
