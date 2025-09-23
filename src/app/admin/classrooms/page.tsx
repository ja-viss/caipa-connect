
import { getAreas } from "@/lib/actions/areas";
import { getClassrooms } from "@/lib/actions/classrooms";
import type { Area, Classroom } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Calendar, Building, Clock } from "lucide-react";
import { AddClassroomDialog } from "@/components/classroom/add-classroom-dialog";
import { DeleteClassroomAlert } from "@/components/classroom/delete-classroom-alert";
import { EditClassroomDialog } from "@/components/classroom/edit-classroom-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export default async function ClassroomManagementPage() {
  const classrooms: Classroom[] = await getClassrooms();
  const areas: Area[] = await getAreas();

  const getAreaName = (areaId: string) => {
    const area = areas.find(a => a.id === areaId);
    return area ? area.name : 'Área desconocida';
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Aulas</h1>
          <p className="text-muted-foreground">Crear aulas, asignar horarios y vincular áreas.</p>
        </div>
      </div>
      
      {classrooms.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {classrooms.map((classroom) => (
              <Card key={classroom.id} className="flex flex-col">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                        Aula {classroom.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                        <Building className="h-4 w-4" />
                        {classroom.building}
                    </CardDescription>
                  </div>
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                       <EditClassroomDialog classroom={classroom} areas={areas} />
                       <DeleteClassroomAlert classroomId={classroom.id} />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4" />
                      Horario Semanal
                    </h4>
                    {classroom.schedule && classroom.schedule.length > 0 ? (
                      <div className="space-y-2">
                        {classroom.schedule.map((slot) => (
                           <div key={slot.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 bg-muted/50 rounded-md">
                            <div className="flex flex-col">
                                <span className="font-semibold">{getAreaName(slot.areaId)}</span>
                                <span className="text-sm text-muted-foreground">{slot.day}</span>
                            </div>
                            <Badge variant="outline" className="mt-2 sm:mt-0">
                                <Clock className="h-3 w-3 mr-1" />
                                {slot.startTime} - {slot.endTime}
                            </Badge>
                           </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No hay horario asignado.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      ) : (
        <Card className="flex items-center justify-center py-20">
            <CardContent className="text-center">
                <h3 className="text-xl font-semibold">No se encontraron aulas</h3>
                <p className="text-muted-foreground">Crea tu primera aula para empezar a organizar los horarios.</p>
            </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <AddClassroomDialog areas={areas} />
      </div>
    </div>
  );
}
