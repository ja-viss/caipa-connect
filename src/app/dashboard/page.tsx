import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, FileText } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold text-foreground">Panel de Control</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Estudiantes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-muted-foreground">
              +5 desde el último mes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Actividades Recientes Registradas
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-muted-foreground">
              en las últimas 24 horas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Informes Generados
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              esta semana
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Comunicaciones Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-primary-foreground">
                  JD
                </div>
                <div>
                  <p className="font-semibold">Jane Doe (Rep)</p>
                  <p className="text-sm text-muted-foreground">Re: Progreso de Liam</p>
                  <p className="text-sm mt-1">Gracias por la actualización, programemos una llamada...</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-primary-foreground">
                  MS
                </div>
                <div>
                  <p className="font-semibold">Sr. Smith</p>
                  <p className="text-sm text-muted-foreground">Pregunta sobre Olivia</p>
                  <p className="text-sm mt-1">¿Podría dar más detalles sobre sus desafíos con...</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                        <span className="text-sm font-bold">JUL</span>
                        <span className="text-xl font-bold">31</span>
                    </div>
                    <div>
                        <p className="font-semibold">Conferencias de Padres y Maestros</p>
                        <p className="text-sm text-muted-foreground">Evento de todo el día</p>
                    </div>
                </div>
                 <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                        <span className="text-sm font-bold">AGO</span>
                        <span className="text-xl font-bold">05</span>
                    </div>
                    <div>
                        <p className="font-semibold">Día de Desarrollo Profesional</p>
                        <p className="text-sm text-muted-foreground">Escuela cerrada para estudiantes</p>
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
