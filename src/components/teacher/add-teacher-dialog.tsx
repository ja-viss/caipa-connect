'use client';

import { useEffect, useState } from 'react';
import { useActionState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { createTeacher } from '@/lib/actions/teachers';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Guardar Docente
    </Button>
  );
}

export function AddTeacherDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [state, action] = useActionState(createTeacher, undefined);

  useEffect(() => {
    if (state?.success === false && state.error?.form) {
      toast({
        title: 'Error',
        description: state.error.form[0],
        variant: 'destructive',
      });
    } else if (state?.success === true) {
       toast({
        title: 'Docente Añadido',
        description: 'El nuevo docente ha sido añadido exitosamente.',
      });
      setOpen(false);
    }
  }, [state, toast]);


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Añadir Docente</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Docente</DialogTitle>
          <DialogDescription>
            Completa la información para añadir un nuevo docente y crear su cuenta de usuario.
          </DialogDescription>
        </DialogHeader>
        <form action={action}>
          <ScrollArea className="h-[60vh] md:h-auto">
           <div className="space-y-4 p-4">
                <div>
                  <Label htmlFor="fullName">Nombre y Apellido</Label>
                  <Input id="fullName" name="fullName" required />
                  {state?.error?.fullName && <p className="text-sm text-destructive mt-1">{state.error.fullName[0]}</p>}
               </div>
               <div>
                  <Label htmlFor="ci">Cédula de Identidad</Label>
                  <Input id="ci" name="ci" type="text" required />
                  {state?.error?.ci && <p className="text-sm text-destructive mt-1">{state.error.ci[0]}</p>}
               </div>
               <div>
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" name="email" type="email" required />
                   {state?.error?.email && <p className="text-sm text-destructive mt-1">{state.error.email[0]}</p>}
               </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" name="phone" required />
                  {state?.error?.phone && <p className="text-sm text-destructive mt-1">{state.error.phone[0]}</p>}
               </div>
                <div>
                  <Label htmlFor="specialization">Especialización</Label>
                  <Input id="specialization" name="specialization" required />
                  {state?.error?.specialization && <p className="text-sm text-destructive mt-1">{state.error.specialization[0]}</p>}
               </div>
               <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" name="password" type="password" required />
                  {state?.error?.password && <p className="text-sm text-destructive mt-1">{state.error.password[0]}</p>}
                </div>
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4">
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

    