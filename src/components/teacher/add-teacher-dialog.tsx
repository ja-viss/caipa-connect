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
import { createTeacher } from '@/lib/actions/teachers';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

const teacherSchema = z.object({
  fullName: z.string().min(1, 'El nombre completo es obligatorio.'),
  email: z.string().email('Correo electrónico inválido.'),
  phone: z.string().min(1, 'El teléfono es obligatorio.'),
  specialization: z.string().min(1, 'La especialización es obligatoria.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});


type TeacherFormValues = z.infer<typeof teacherSchema>;

export function AddTeacherDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
  });

  const onSubmit: SubmitHandler<TeacherFormValues> = async (data) => {
    const result = await createTeacher(data);
    if (result.success) {
      toast({
        title: 'Docente Añadido',
        description: 'El nuevo docente ha sido añadido exitosamente.',
      });
      reset();
      setOpen(false);
    } else {
      let errorMessage = 'No se pudo añadir al docente.';
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
        <Button>Añadir Docente</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Docente</DialogTitle>
          <DialogDescription>
            Completa la información para añadir un nuevo docente y crear su cuenta de usuario.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
           <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="fullName">Nombre y Apellido</Label>
                  <Input id="fullName" {...register('fullName')} />
                  {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>}
               </div>
               <div>
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" type="email" {...register('email')} />
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
               </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" {...register('phone')} />
                  {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>}
               </div>
                <div>
                  <Label htmlFor="specialization">Especialización</Label>
                  <Input id="specialization" {...register('specialization')} />
                  {errors.specialization && <p className="text-sm text-destructive mt-1">{errors.specialization.message}</p>}
               </div>
               <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" type="password" {...register('password')} />
                  {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
                </div>
            </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Docente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}