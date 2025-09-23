'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
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
  const [state, action] = useActionState(loginUser, undefined);

  useEffect(() => {
    if (state?.success && state.redirectTo) {
      window.location.href = state.redirectTo;
    }
  }, [state]);

  return (
    <div className="mx-auto grid w-full max-w-sm gap-6 px-4">
      <div className="grid gap-2 text-center">
        <div className="flex justify-center items-center gap-2 mb-2">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8 text-primary"
            >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
            </svg>
            <h1 className="text-3xl font-bold">CAIPA Connect</h1>
        </div>
        <p className="text-balance text-muted-foreground">
          Sistema de Control Automatizado para la Gestión Estudiantil.
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
              href="/forgot-password"
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
        <span className="text-muted-foreground">Comunícate con la institución para crear tu usuario.</span>
      </div>
    </div>
  );
}
