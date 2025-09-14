'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import type { User } from '@/lib/types';
import { updateUserProfile } from '@/lib/actions/users';

const userProfileSchema = z.object({
  fullName: z.string().min(1, 'El nombre completo es obligatorio.'),
  password: z.string().optional(),
}).refine(data => !data.password || data.password.length >= 6, {
  message: 'La nueva contraseña debe tener al menos 6 caracteres.',
  path: ['password'],
});

type UserProfileFormValues = z.infer<typeof userProfileSchema>;

interface UserProfileFormProps {
  user: User;
}

export function UserProfileForm({ user }: UserProfileFormProps) {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserProfileFormValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      fullName: user.fullName,
      password: '',
    },
  });

  const onSubmit: SubmitHandler<UserProfileFormValues> = async (data) => {
    const result = await updateUserProfile(data);

    if (result.success) {
      toast({
        title: 'Perfil Actualizado',
        description: 'Tu información ha sido actualizada exitosamente.',
      });
      reset({ fullName: data.fullName, password: '' });
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
        <Label htmlFor="fullName">Nombre Completo</Label>
        <Input id="fullName" {...register('fullName')} />
        {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>}
      </div>
      <div>
        <Label htmlFor="email">Correo Electrónico</Label>
        <Input id="email" type="email" value={user.email} disabled />
      </div>
      <div>
        <Label htmlFor="password">Nueva Contraseña</Label>
        <Input id="password" type="password" placeholder="Dejar en blanco para no cambiar" {...register('password')} />
         {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Guardar Cambios
      </Button>
    </form>
  );
}
