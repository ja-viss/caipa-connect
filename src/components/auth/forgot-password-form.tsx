'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { requestPasswordReset, verifySecurityAnswer, resetPassword } from '@/lib/actions/users';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { CheckCircle } from 'lucide-react';

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Procesando...' : text}
    </Button>
  );
}

export function ForgotPasswordForm() {
  const [step, setStep] = useState(1); // 1: email, 2: question, 3: new password, 4: success
  const [email, setEmail] = useState('');
  const [question, setQuestion] = useState('');

  const [requestState, requestAction, isRequestPending] = useActionState(requestPasswordReset, undefined);
  const [verifyState, verifyAction, isVerifyPending] = useActionState(verifySecurityAnswer, undefined);
  const [resetState, resetAction, isResetPending] = useActionState(resetPassword, undefined);

  if (requestState?.success && step === 1) {
    setEmail(requestState.email);
    setQuestion(requestState.question);
    setStep(2);
  }

  if (verifyState?.success && step === 2) {
    setStep(3);
  }
  
  if (resetState?.success && step === 3) {
      setStep(4);
  }

  return (
    <div className="mx-auto grid w-[350px] gap-6">
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold">Recuperar Contraseña</h1>
        <p className="text-balance text-muted-foreground">Sigue los pasos para restablecer tu contraseña.</p>
      </div>

      {step === 1 && (
        <form action={requestAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" name="email" type="email" placeholder="nombre@ejemplo.com" required />
          </div>
          {requestState?.error && <p className="text-sm text-destructive">{requestState.error}</p>}
          <SubmitButton text="Siguiente" />
        </form>
      )}

      {step === 2 && (
        <form action={verifyAction} className="grid gap-4">
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="question" value={question} />
            <div className="p-4 bg-muted rounded-md">
                <p className="text-sm font-semibold">Pregunta de Seguridad:</p>
                <p className="text-sm">{question}</p>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="answer">Tu Respuesta</Label>
                <Input id="answer" name="answer" type="text" required />
            </div>
            {verifyState?.error && <p className="text-sm text-destructive">{verifyState.error}</p>}
            <SubmitButton text="Verificar Respuesta" />
        </form>
      )}

      {step === 3 && (
        <form action={resetAction} className="grid gap-4">
            <input type="hidden" name="email" value={email} />
            <div className="grid gap-2">
                <Label htmlFor="password">Nueva Contraseña</Label>
                <Input id="password" name="password" type="password" required />
            </div>
            {resetState?.error && <p className="text-sm text-destructive">{resetState.error}</p>}
            <SubmitButton text="Restablecer Contraseña" />
        </form>
      )}

      {step === 4 && (
        <Alert variant="default" className="border-green-500">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-600">¡Éxito!</AlertTitle>
            <AlertDescription>
                Tu contraseña ha sido restablecida correctamente. Ya puedes iniciar sesión.
            </AlertDescription>
        </Alert>
      )}


      <div className="mt-4 text-center text-sm">
        ¿Recordaste tu contraseña?{' '}
        <Link href="/login" className="underline">
          Iniciar Sesión
        </Link>
      </div>
    </div>
  );
}
