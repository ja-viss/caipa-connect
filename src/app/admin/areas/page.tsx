import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AreaManagementPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestión de Áreas</h1>
        <p className="text-muted-foreground">Crear y administrar áreas de especialización.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Áreas</CardTitle>
          <CardDescription>
            Este es un marcador de posición para la interfaz de gestión de áreas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Las funciones para crear y administrar áreas de especialización se implementarán aquí.</p>
        </CardContent>
      </Card>
    </div>
  );
}
