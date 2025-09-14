'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import type { Teacher } from '@/lib/types';
import { updateTeacherProfile } from '@/lib/actions/teachers';

const teacherProfileSchema = z.object({
  phone: z.string().min(1, 'El teléfono es obligatorio.'),
  specialization: z.string().min(1, 'La especialización es obligatoria.'),
});

type TeacherProfileFormValues = z.infer<typeof teacherProfileSchema>;

interface TeacherProfileFormProps {
  teacher: Teacher;
}

export function TeacherProfileForm({ teacher }: TeacherProfileFormProps) {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TeacherProfileFormValues>({
    resolver: zodResolver(teacherProfileSchema),
    defaultValues: {
      phone: teacher.phone,
      specialization: teacher.specialization,
    },
  });

  const onSubmit: SubmitHandler<TeacherProfileFormValues> = async (data) => {
    const result = await updateTeacherProfile(teacher.id, data);
    if (result.success) {
      toast({
        title: 'Perfil de Docente Actualizado',
        description: 'Tu información profesional ha sido actualizada.',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'No se pudo actualizar tu perfil.',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Guardar Cambios
      </Button>
    </form>
  );
}
