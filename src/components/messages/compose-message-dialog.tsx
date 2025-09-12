'use client';

import { useEffect, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { sendMessage } from '@/lib/actions/messages';
import { Loader2, Send } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { Teacher, Student } from '@/lib/types';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Enviar Mensaje
    </Button>
  );
}

interface ComposeMessageDialogProps {
  teachers: Teacher[];
  representatives: Student['representative'][];
}

export function ComposeMessageDialog({ teachers, representatives }: ComposeMessageDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [state, action] = useActionState(sendMessage, undefined);
  const [recipientType, setRecipientType] = useState<string>('');
  
  useEffect(() => {
    if (state?.success === false && state.error?.form) {
      toast({
        title: 'Error',
        description: state.error.form[0],
        variant: 'destructive',
      });
    } else if (state?.success === true) {
      toast({
        title: 'Mensaje Enviado',
        description: 'El mensaje ha sido enviado exitosamente.',
      });
      setRecipientType('');
      setOpen(false);
    }
  }, [state, toast]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        setRecipientType('');
    }
    setOpen(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Send className="mr-2 h-4 w-4" />
          Redactar Mensaje
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Redactar Nuevo Mensaje</DialogTitle>
          <DialogDescription>
            Selecciona el destinatario y escribe tu mensaje o anuncio.
          </DialogDescription>
        </DialogHeader>
        <form action={action}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="recipientType">Destinatario</Label>
                     <Select name="recipientType" onValueChange={setRecipientType} required>
                        <SelectTrigger id="recipientType">
                            <SelectValue placeholder="Seleccionar destinatario..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all-teachers">Todos los Docentes</SelectItem>
                            <SelectItem value="all-reps">Todos los Representantes</SelectItem>
                            <SelectItem value="teacher">Un Docente Específico</SelectItem>
                            <SelectItem value="rep">Un Representante Específico</SelectItem>
                        </SelectContent>
                    </Select>
                     {state?.error?.recipientType && <p className="text-sm text-destructive mt-1">{state.error.recipientType[0]}</p>}
                </div>
                 {(recipientType === 'teacher' || recipientType === 'rep') && (
                    <div>
                        <Label htmlFor="recipientId">Seleccionar Específico</Label>
                         <Select name="recipientId" required>
                            <SelectTrigger id="recipientId">
                                <SelectValue placeholder={`Seleccionar ${recipientType === 'teacher' ? 'docente' : 'representante'}...`} />
                            </SelectTrigger>
                            <SelectContent>
                                {recipientType === 'teacher' && teachers.map(t => (
                                    <SelectItem key={t.id} value={t.id}>{t.fullName}</SelectItem>
                                ))}
                                {recipientType === 'rep' && representatives.map(r => (
                                    <SelectItem key={r.email} value={r.email}>{r.name} ({r.email})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>
             <div>
                <Label htmlFor="subject">Asunto</Label>
                <Input id="subject" name="subject" required />
                {state?.error?.subject && <p className="text-sm text-destructive mt-1">{state.error.subject[0]}</p>}
            </div>
            <div>
                <Label htmlFor="body">Mensaje</Label>
                <Textarea id="body" name="body" rows={8} required />
                 {state?.error?.body && <p className="text-sm text-destructive mt-1">{state.error.body[0]}</p>}
            </div>
          </div>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
