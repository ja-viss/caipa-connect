import { getMessagesForRepresentative } from "@/lib/actions/messages";
import { getSession } from "@/lib/actions/users";
import { getStudentByRepEmail } from "@/lib/actions/students";
import type { Message } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";
import { redirect } from "next/navigation";

export default async function RepresentativeMessagesPage() {
  const session = await getSession();
  if (!session?.user?.email) {
    redirect('/login');
  }

  const student = await getStudentByRepEmail(session.user.email);
  if (!student) {
    return <p>Estudiante no encontrado.</p>;
  }
  
  const messages: Message[] = await getMessagesForRepresentative(student.representative.email);

  return (
    <div className="flex flex-col gap-8 h-full">
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Buzón de Mensajes</h1>
          <p className="text-muted-foreground">Aquí encontrarás los anuncios y mensajes importantes de la institución.</p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col">
        <CardHeader>
            <CardTitle>Mensajes Recibidos</CardTitle>
            <CardDescription>Historial de todos los mensajes y anuncios recibidos.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-0">
            <ScrollArea className="h-[calc(100vh-20rem)]">
                {messages.length > 0 ? (
                    <div className="space-y-4 p-4">
                        {messages.map((message) => (
                            <div key={message.id} className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                    <div>
                                        <p className="font-semibold text-lg">{message.subject}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        {new Date(message.timestamp).toLocaleString('es-VE')}
                                      </span>
                                    </div>
                                </div>
                                <div className="mt-4 p-3 bg-muted/50 rounded-md">
                                    <p className="text-sm">{message.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full p-10 text-center">
                        <MessageSquare className="h-16 w-16 text-muted-foreground/50" />
                        <h3 className="text-xl font-semibold mt-4">No tienes mensajes</h3>
                        <p className="text-muted-foreground mt-2">Los nuevos anuncios y mensajes aparecerán aquí.</p>
                    </div>
                )}
            </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
