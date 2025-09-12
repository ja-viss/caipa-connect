'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { updateTeacher } from '@/lib/actions/teachers';
import { Loader2, Pencil } from 'lucide-react';
import type { Teacher } from '@/lib/types';
import { DropdownMenuItem } from '../ui/dropdown-menu';

const updateTeacherSchema = z.object({
  fullName: z.string().min(1, 'El nombre completo es obligatorio.'),
  email: z.string().email('Correo electrónico inválido.'),
  phone: z.string().min(1, 'El teléfono es obligatorio.'),
  specialization: z.string().min(1, 'La especialización es obligatoria.'),
});


type TeacherFormValues = z.infer<typeof updateTeacherSchema>;

interface EditTeacherDialogProps {
  teacher: Teacher;
}

export function EditTeacherDialog({ teacher }: EditTeacherDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TeacherFormValues>({
    resolver: zodResolver(updateTeacherSchema),
    defaultValues: {
      fullName: teacher.fullName,
      email: teacher.email,
      phone: teacher.phone,
      specialization: teacher.specialization,
    },
  });

  const onSubmit: SubmitHandler<TeacherFormValues> = async (data) => {
    const result = await updateTeacher(teacher.id, data);
    if (result.success) {
      toast({
        title: 'Docente Actualizado',
        description: 'La información del docente ha sido actualizada exitosamente.',
      });
      setOpen(false);
    } else {
       let errorMessage = 'No se pudo actualizar la información del docente.';
       if (result.error instanceof z.ZodError) {
        errorMessage = result.error.errors.map(e => e.message).join(', ');
      } else if (typeof result.error === 'string') {
        errorMessage = result.error;
      }
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
         <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Editar Información del Docente</DialogTitle>
          <DialogDescription>
            Actualiza la información del docente. Haz clic en guardar cuando termines.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 py-4">
                 <div>
                  <Label htmlFor="fullName-edit">Nombre y Apellido</Label>
                  <Input id="fullName-edit" {...register('fullName')} />
                  {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>}
               </div>
               <div>
                  <Label htmlFor="email-edit">Correo Electrónico</Label>
                  <Input id="email-edit" type="email" {...register('email')} />
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
               </div>
                <div>
                  <Label htmlFor="phone-edit">Teléfono</Label>
                  <Input id="phone-edit" {...register('phone')} />
                  {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>}
               </div>
                <div>
                  <Label htmlFor="specialization-edit">Especialización</Label>
                  <Input id="specialization-edit" {...register('specialization')} />
                  {errors.specialization && <p className="text-sm text-destructive mt-1">{errors.specialization.message}</p>}
               </div>
            </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}