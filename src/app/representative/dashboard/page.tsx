import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getStudentByRepEmail, getActivityLogsByStudentId, getProgressReportsByStudentId } from '@/lib/actions/students';
import { getUpcomingEvents } from "@/lib/actions/students";
import type { Student, ActivityLog, ProgressReport, Event } from "@/lib/types";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { User, Calendar, FileText, Activity } from "lucide-react";

// This is a mock function to simulate getting the current user's email
// In a real app with authentication, you would get this from the session.
const getCurrentUserEmail = async () => {
    // For now, let's hardcode an email of a representative that exists in the DB.
    // This will need to be replaced with actual session logic.
    // Let's assume 'ana.gomez@email.com' is a representative.
    return 'ana.gomez@email.com';
};

export default async function RepresentativeDashboard() {
  const userEmail = await getCurrentUserEmail();
  const student: Student | null = await getStudentByRepEmail(userEmail);

  if (!student) {
    return (
        <div className="flex items-center justify-center h-full">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>No se encontró información del estudiante</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        No pudimos encontrar un estudiante asociado a tu cuenta. Por favor, contacta a la administración.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
  }

  const logs: ActivityLog[] = await getActivityLogsByStudentId(student.id);
  const reports: ProgressReport[] = await getProgressReportsByStudentId(student.id);
  const events: Event[] = await getUpcomingEvents();

  return (
    <div className="flex flex-col gap-8">
        <div className="flex items-center gap-4">
             <Avatar className="h-20 w-20">
              <AvatarImage src={student.avatar?.imageUrl} alt={student.name} data-ai-hint={student.avatar?.imageHint} />
              <AvatarFallback className="text-3xl">{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
                <h1 className="text-3xl font-bold text-foreground">Panel de {student.name}</h1>
                <p className="text-muted-foreground">Bienvenido/a, {student.representative.name}. Aquí tienes un resumen del progreso de tu hijo/a.</p>
            </div>
        </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Registros de Actividad Reciente
            </CardTitle>
            <CardDescription>Últimas 5 actividades registradas por los docentes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {logs.length > 0 ? (
                logs.slice(0, 5).map((log) => (
                  <div key={log.id} className="text-sm p-3 bg-muted/50 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold">{log.teacher}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(log.date), 'PPP', { locale: es })}</p>
                    </div>
                    <p><strong>Logros:</strong> {log.achievements}</p>
                    <p><strong>Desafíos:</strong> {log.challenges}</p>
                    <p><strong>Observaciones:</strong> {log.observations}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No se encontraron registros de actividad.</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informes de Progreso
            </CardTitle>
            <CardDescription>Últimos informes generados sobre el avance de tu hijo/a.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-6 max-h-96 overflow-y-auto">
                {reports.length > 0 ? (
                    reports.slice(0, 2).map(report => (
                        <div key={report.id}>
                            <p className="text-sm font-semibold text-muted-foreground mb-2">Informe del {format(new Date(report.date), 'PPP', { locale: es })}</p>
                            <div className="p-4 bg-muted/50 rounded-md text-sm whitespace-pre-wrap font-mono h-40 overflow-y-auto border">
                                {report.content}
                            </div>
                        </div>
                    ))
                 ) : (
                    <p className="text-sm text-muted-foreground">No se han generado informes.</p>
                 )}
             </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximos Eventos
            </CardTitle>
             <CardDescription>Eventos importantes y fechas a recordar.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.length > 0 ? (
                events.map((event: Event) => (
                  <div key={event.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-md">
                    <div className="flex flex-col items-center p-2 bg-background rounded-md border">
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
                <p className="text-sm text-muted-foreground">No hay próximos eventos en el calendario.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
