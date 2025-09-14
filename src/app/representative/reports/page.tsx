import { getSession } from "@/lib/actions/users";
import { getStudentByRepEmail, getProgressReportsByStudentId } from "@/lib/actions/students";
import type { ProgressReport, Student } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { redirect } from "next/navigation";

export default async function RepresentativeReportsPage() {
    const session = await getSession();
    if (!session?.user?.email) {
        redirect('/login');
    }

    const student: Student | null = await getStudentByRepEmail(session.user.email);
    if (!student) {
        return <p>No se encontró información del estudiante.</p>;
    }
    
    const reports: ProgressReport[] = await getProgressReportsByStudentId(student.id);

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Informes de Progreso de {student.name}</h1>
                <p className="text-muted-foreground">Historial de todos los informes generados.</p>
            </div>

             <Card>
                <CardHeader>
                    <CardTitle>Historial de Informes</CardTitle>
                    <CardDescription>Consulta todos los informes de progreso de tu hijo/a.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                        {reports.length > 0 ? (
                            reports.map(report => (
                                <div key={report.id}>
                                    <p className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Informe del {format(new Date(report.date), 'PPP', { locale: es })}
                                    </p>
                                    <div className="p-4 bg-muted/50 rounded-md text-sm whitespace-pre-wrap font-mono border max-h-60 overflow-y-auto">
                                        {report.content}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-10">No se han generado informes para {student.name}.</p>
                        )}
                     </div>
                </CardContent>
             </Card>
        </div>
    )
}
