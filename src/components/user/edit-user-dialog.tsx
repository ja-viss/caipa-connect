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
import { useToast } from '@/hooks/use-toast';
import { updateUser } from '@/lib/actions/users';
import { Loader2, Pencil } from 'lucide-react';
import { DropdownMenuItem } from '../ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { User } from '@/lib/types';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Guardar Cambios
    </Button>
  );
}

interface EditUserDialogProps {
    user: User;
}

export function EditUserDialog({ user }: EditUserDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const updateUserWithId = updateUser.bind(null, user.id);
  const [state, action] = useActionState(updateUserWithId, undefined);

  useEffect(() => {
    if (state?.success === false) {
      toast({
        title: 'Error',
        description: state.error?.form?.[0] || 'No se pudo actualizar el usuario.',
        variant: 'destructive',
      });
    } else if (state?.success === true) {
       toast({
        title: 'Usuario Actualizado',
        description: 'La información del usuario ha sido actualizada exitosamente.',
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>
            Actualiza la información del usuario. Haz clic en guardar cuando termines.
          </DialogDescription>
        </DialogHeader>
        <form action={action}>
           <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor={`fullName-${user.id}`}>Nombre Completo</Label>
                  <Input id={`fullName-${user.id}`} name="fullName" defaultValue={user.fullName} required />
                  {state?.error?.fullName && <p className="text-sm text-destructive mt-1">{state.error.fullName[0]}</p>}
               </div>
               <div>
                  <Label htmlFor={`email-${user.id}`}>Correo Electrónico</Label>
                  <Input id={`email-${user.id}`} name="email" type="email" value={user.email} disabled />
               </div>
                <div>
                  <Label htmlFor={`role-${user.id}`}>Rol</Label>
                  <Select name="role" defaultValue={user.role} required>
                    <SelectTrigger id={`role-${user.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="teacher">Docente</SelectItem>
                      <SelectItem value="representative">Representante</SelectItem>
                    </SelectContent>
                  </Select>
                  {state?.error?.role && <p className="text-sm text-destructive mt-1">{state.error.role[0]}</p>}
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
