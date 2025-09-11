'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { createStudent } from '@/lib/actions/students';
import { Loader2 } from 'lucide-react';

const studentSchema = z.object({
  name: z.string().min(1, 'El nombre del estudiante es obligatorio.'),
  email: z.string().email('Correo electrónico de estudiante inválido.'),
  representativeName: z.string().min(1, 'El nombre del representante es obligatorio.'),
  representativeEmail: z.string().email('Correo electrónico de representante inválido.'),
});

type StudentFormValues = z.infer<typeof studentSchema>;

export function AddStudentDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
  });

  const onSubmit = async (data: StudentFormValues) => {
    setIsSubmitting(true);
    const result = await createStudent(data);
    if (result.success) {
      toast({
        title: 'Estudiante Añadido',
        description: 'El nuevo estudiante ha sido añadido exitosamente.',
      });
      reset();
      setOpen(false);
    } else {
      toast({
        title: 'Error',
        description: result.error || 'No se pudo añadir al estudiante.',
        variant: 'destructive',
      });
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Añadir Estudiante</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Estudiante</DialogTitle>
          <DialogDescription>
            Completa la información para añadir un nuevo estudiante al sistema.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nombre
            </Label>
            <div className="col-span-3">
              <Input id="name" {...register('name')} className="w-full" />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
             <div className="col-span-3">
              <Input id="email" type="email" {...register('email')} className="w-full" />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="representativeName" className="text-right">
              Rep. Nombre
            </Label>
             <div className="col-span-3">
              <Input id="representativeName" {...register('representativeName')} className="w-full" />
              {errors.representativeName && <p className="text-sm text-destructive mt-1">{errors.representativeName.message}</p>}
            </div>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="representativeEmail" className="text-right">
              Rep. Email
            </Label>
            <div className="col-span-3">
              <Input id="representativeEmail" type="email" {...register('representativeEmail')} className="w-full" />
              {errors.representativeEmail && <p className="text-sm text-destructive mt-1">{errors.representativeEmail.message}</p>}
            </div>
          </div>
        <DialogFooter>
          <Button type="submit" disabled={isSubmitting}>
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Estudiante
          </Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
