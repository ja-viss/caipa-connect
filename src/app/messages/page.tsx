import { getMessages } from "@/lib/actions/messages";
import { getStudents } from "@/lib/actions/students";
import { getTeachers } from "@/lib/actions/teachers";
import type { Message, Student, Teacher } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, User, Bot, MessageSquare, MoreVertical } from "lucide-react";
import { ComposeMessageDialog } from "@/components/messages/compose-message-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditMessageDialog } from "@/components/messages/edit-message-dialog";
import { DeleteMessageAlert } from "@/components/messages/delete-message-alert";

function getRecipientName(message: Message, teachers: Teacher[], students: Student[]): string {
    switch (message.recipient.type) {
        case 'all-teachers':
            return 'Todos los Docentes';
        case 'all-reps':
            return 'Todos los Representantes';
        case 'teacher':
            const teacher = teachers.find(t => t.id === message.recipient.id);
            return teacher?.fullName || 'Docente Desconocido';
        case 'rep':
            const student = students.find(s => s.representative.email === message.recipient.id); // Assuming ID is email for reps
            return student?.representative.name || 'Representante Desconocido';
        default:
            return 'Desconocido';
    }
}

function getRecipientBadge(type: Message['recipient']['type']) {
    switch (type) {
        case 'all-teachers':
            return <Badge variant="secondary"><Users className="mr-1 h-3 w-3" />Docentes</Badge>;
        case 'all-reps':
            return <Badge variant="secondary"><Users className="mr-1 h-3 w-3" />Representantes</Badge>;
        case 'teacher':
            return <Badge variant="outline"><User className="mr-1 h-3 w-3" />Docente</Badge>;
        case 'rep':
            return <Badge variant="outline"><User className="mr-1 h-3 w-3" />Representante</Badge>;
        default:
            return null;
    }
}


export default async function MessagesPage() {
  const messages: Message[] = await getMessages();
  const teachers: Teacher[] = await getTeachers();
  const students: Student[] = await getStudents();

  const representatives = students.map(s => s.representative).filter(
    (rep, index, self) => index === self.findIndex((r) => r.email === rep.email)
  );

  return (
    <div className="flex flex-col gap-8 h-full">
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Centro de Mensajes</h1>
          <p className="text-muted-foreground">Envía anuncios y mensajes a docentes y representantes.</p>
        </div>
        <ComposeMessageDialog teachers={teachers} representatives={representatives} />
      </div>

      <Card className="flex-1 flex flex-col">
        <CardHeader>
            <CardTitle>Mensajes Enviados</CardTitle>
            <CardDescription>Historial de todos los mensajes y anuncios enviados.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-0">
            <ScrollArea className="h-[calc(100vh-20rem)]">
                {messages.length > 0 ? (
                    <div className="space-y-4 p-4">
                        {messages.map((message) => (
                            <div key={message.id} className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                    <div className="flex-1">
                                        <p className="font-semibold text-lg">{message.subject}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Para: {getRecipientName(message, teachers, students)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 self-start">
                                      {getRecipientBadge(message.recipient.type)}
                                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        {new Date(message.timestamp).toLocaleString('es-VE')}
                                      </span>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-6 w-6">
                                            <MoreVertical className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <EditMessageDialog message={message} />
                                          <DeleteMessageAlert messageId={message.id} />
                                        </DropdownMenuContent>
                                      </DropdownMenu>
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
                        <h3 className="text-xl font-semibold mt-4">No hay mensajes enviados</h3>
                        <p className="text-muted-foreground mt-2">Envía tu primer mensaje para iniciar la comunicación.</p>
                    </div>
                )}
            </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
