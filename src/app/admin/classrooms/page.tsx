import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ClassroomManagementPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestión de Aulas</h1>
        <p className="text-muted-foreground">Gestionar aulas y asignaciones de estudiantes.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Aulas</CardTitle>
          <CardDescription>
            Este es un marcador de posición para la interfaz de gestión de aulas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Las funciones para crear grupos y asignar estudiantes se implementarán aquí.</p>
        </CardContent>
      </Card>
    </div>
  );
}
