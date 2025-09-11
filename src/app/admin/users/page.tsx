import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function UserManagementPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestión de Usuarios</h1>
        <p className="text-muted-foreground">Administrar roles y permisos de usuario.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
          <CardDescription>
            Este es un marcador de posición para la interfaz de gestión de usuarios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Las funciones de administración de usuarios se implementarán aquí.</p>
        </CardContent>
      </Card>
    </div>
  );
}
