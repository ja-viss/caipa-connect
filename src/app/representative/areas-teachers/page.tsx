import { getSession } from "@/lib/actions/users";
import { getStudentByRepEmail } from "@/lib/actions/students";
import { getAreas } from "@/lib/actions/areas";
import { getTeachers } from "@/lib/actions/teachers";
import type { Area, Student, Teacher } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Contact, Shapes } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AreasTeachersPage() {
  const session = await getSession();
  if (!session?.user?.email) {
    redirect('/login');
  }

  const student: Student | null = await getStudentByRepEmail(session.user.email);
  if (!student) {
    return <p>No se encontró información del estudiante.</p>;
  }

  const allAreas: Area[] = await getAreas();
  const allTeachers: Teacher[] = await getTeachers();
  
  const studentAreas = allAreas.filter(area => area.studentIds?.includes(student.id));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Áreas y Docentes de {student.name}</h1>
        <p className="text-muted-foreground">Información sobre las áreas de especialización y los docentes asignados.</p>
      </div>
      
      {studentAreas.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {studentAreas.map((area) => {
            const assignedTeachers = allTeachers.filter(t => area.teacherIds?.includes(t.id));
            return (
              <Card key={area.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shapes className="h-5 w-5" />
                    {area.name}
                  </CardTitle>
                  <CardDescription>{area.description}</CardDescription>
                </CardHeader>
                <CardContent>
                   <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                      <Contact className="h-4 w-4" />
                      Docentes Asignados ({assignedTeachers.length})
                    </h4>
                    {assignedTeachers.length > 0 ? (
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {assignedTeachers.map(t => <li key={t.id}>{t.fullName} ({t.specialization})</li>)}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No hay docentes asignados a esta área.</p>
                    )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="flex items-center justify-center py-20">
            <CardContent className="text-center">
                <h3 className="text-xl font-semibold">Estudiante no asignado a áreas</h3>
                <p className="text-muted-foreground">Actualmente, {student.name} no está asignado/a a ninguna área.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
