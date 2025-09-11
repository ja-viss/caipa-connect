import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function TeacherManagementPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestión de Docentes</h1>
        <p className="text-muted-foreground">Administrar perfiles de docentes y asignaciones a áreas.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Docentes</CardTitle>
          <CardDescription>
            Este es un marcador de posición para la interfaz de gestión de docentes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Las funciones para crear, editar y asignar docentes se implementarán aquí.</p>
        </CardContent>
      </Card>
    </div>
  );
}
