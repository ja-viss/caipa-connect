import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Users, FileText, AlertTriangle } from 'lucide-react';
import { getDashboardStats } from "@/lib/actions/students";
import type { Conversation, Event, DashboardStats } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AdminCharts } from "@/components/dashboard/admin-charts";

export default async function Dashboard() {
  let stats: DashboardStats | null = null;
  let error: string | null = null;

  try {
    stats = await getDashboardStats();
  } catch (e) {
    console.error("Failed to fetch dashboard stats:", e);
    error = "No se pudieron cargar las estadísticas del panel de control. Por favor, inténtelo de nuevo más tarde.";
  }

  if (error || !stats) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Error al Cargar el Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error || "Ocurrió un error desconocido."}</p>
        </CardContent>
      </Card>
    );
  }

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
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              estudiantes registrados
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
            <div className="text-2xl font-bold">{stats.recentActivities}</div>
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
            <div className="text-2xl font-bold">{stats.reportsGenerated}</div>
            <p className="text-xs text-muted-foreground">
              esta semana
            </p>
          </CardContent>
        </Card>
      </div>

      <AdminCharts studentsByArea={stats.studentsByArea} studentsByGender={stats.studentsByGender} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Comunicaciones Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentConversations.length > 0 ? (
                stats.recentConversations.map((convo: Conversation) => (
                  <div key={convo.id} className="flex items-start gap-4">
                     <Avatar className="h-10 w-10">
                        <AvatarImage src={convo.contactAvatar.imageUrl} alt={convo.contactName} data-ai-hint={convo.contactAvatar.imageHint} />
                        <AvatarFallback>{convo.contactName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{convo.contactName}</p>
                      <p className="text-sm text-muted-foreground truncate">{convo.lastMessagePreview}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No hay comunicaciones recientes.</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.upcomingEvents.length > 0 ? (
                stats.upcomingEvents.map((event: Event) => (
                  <div key={event.id} className="flex items-center gap-4">
                    <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                        <span className="text-sm font-bold uppercase">{format(new Date(event.date), 'MMM', { locale: es })}</span>
                        <span className="text-xl font-bold">{format(new Date(event.date), 'dd')}</span>
                    </div>
                    <div>
                        <p className="font-semibold">{event.title}</p>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No hay próximos eventos.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
