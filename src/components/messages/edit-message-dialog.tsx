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
import { updateMessage } from '@/lib/actions/messages';
import { Loader2, Pencil } from 'lucide-react';
import { DropdownMenuItem } from '../ui/dropdown-menu';
import type { Message } from '@/lib/types';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Guardar Cambios
    </Button>
  );
}

interface EditMessageDialogProps {
  message: Message;
}

export function EditMessageDialog({ message }: EditMessageDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const updateMessageWithId = updateMessage.bind(null, message.id);
  const [state, action] = useActionState(updateMessageWithId, undefined);
  
  useEffect(() => {
    if (state?.success === false && state.error?.form) {
      toast({
        title: 'Error',
        description: state.error.form[0],
        variant: 'destructive',
      });
    } else if (state?.success === true) {
      toast({
        title: 'Mensaje Actualizado',
        description: 'El mensaje ha sido actualizado exitosamente.',
      });
      setOpen(false);
    }
  }, [state, toast]);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Mensaje</DialogTitle>
          <DialogDescription>
            Realiza los cambios necesarios en el mensaje. Al guardar, se marcará como no leído para todos los destinatarios.
          </DialogDescription>
        </DialogHeader>
        <form action={action}>
          <div className="space-y-4 py-4">
             <div>
                <Label htmlFor={`subject-${message.id}`}>Asunto</Label>
                <Input id={`subject-${message.id}`} name="subject" defaultValue={message.subject} required />
                {state?.error?.subject && <p className="text-sm text-destructive mt-1">{state.error.subject[0]}</p>}
            </div>
            <div>
                <Label htmlFor={`body-${message.id}`}>Mensaje</Label>
                <Textarea id={`body-${message.id}`} name="body" rows={8} defaultValue={message.body} required />
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
