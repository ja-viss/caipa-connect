'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createUser } from '@/lib/actions/users';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Creando Cuenta...' : 'Crear Cuenta'}
    </Button>
  );
}

export function RegisterForm() {
  const [state, action] = useActionState(createUser, undefined);

  return (
    <div className="mx-auto grid w-[350px] gap-6">
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold">Registrarse</h1>
        <p className="text-balance text-muted-foreground">
          Ingresa tu información para crear una cuenta nueva
        </p>
      </div>
      <form action={action} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="fullName">Nombre Completo</Label>
          <Input id="fullName" name="fullName" placeholder="John Doe" required />
          {state?.error?.fullName && <p className="text-sm text-destructive">{state.error.fullName[0]}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Correo Electrónico</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="nombre@ejemplo.com"
            required
          />
           {state?.error?.email && <p className="text-sm text-destructive">{state.error.email[0]}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" name="password" type="password" required />
           {state?.error?.password && <p className="text-sm text-destructive">{state.error.password[0]}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="role">Rol</Label>
          <Select name="role" required>
            <SelectTrigger id="role">
              <SelectValue placeholder="Selecciona un rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="teacher">Docente</SelectItem>
              <SelectItem value="representative">Representante</SelectItem>
            </SelectContent>
          </Select>
           {state?.error?.role && <p className="text-sm text-destructive">{state.error.role[0]}</p>}
        </div>
         {state?.error?.form && <p className="text-sm text-destructive">{state.error.form[0]}</p>}
        <SubmitButton />
      </form>
      <div className="mt-4 text-center text-sm">
        ¿Ya tienes una cuenta?{' '}
        <Link href="/login" className="underline">
          Iniciar Sesión
        </Link>
      </div>
    </div>
  );
}
