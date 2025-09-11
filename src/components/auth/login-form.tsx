'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginUser } from '@/lib/actions/users';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
    </Button>
  );
}

export function LoginForm() {
  const [state, action] = useFormState(loginUser, undefined);

  return (
    <div className="mx-auto grid w-[350px] gap-6">
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold">Iniciar Sesión</h1>
        <p className="text-balance text-muted-foreground">
          Ingresa tu correo electrónico para acceder a tu cuenta
        </p>
      </div>
      <form action={action} className="grid gap-4">
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
          <div className="flex items-center">
            <Label htmlFor="password">Contraseña</Label>
            <Link
              href="#"
              className="ml-auto inline-block text-sm underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <Input id="password" name="password" type="password" required />
           {state?.error?.password && <p className="text-sm text-destructive">{state.error.password[0]}</p>}
        </div>
        {state?.error?.form && <p className="text-sm text-destructive">{state.error.form[0]}</p>}
        <SubmitButton />
      </form>
      <div className="mt-4 text-center text-sm">
        ¿No tienes una cuenta?{' '}
        <Link href="/register" className="underline">
          Registrarse
        </Link>
      </div>
    </div>
  );
}
