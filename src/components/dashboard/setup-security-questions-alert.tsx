'use client';

import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import type { User } from '@/lib/types';

interface SetupSecurityQuestionsAlertProps {
  user: User;
}

export function SetupSecurityQuestionsAlert({ user }: SetupSecurityQuestionsAlertProps) {
  if (user.securityQuestions && user.securityQuestions.length > 0) {
    return null;
  }

  return (
    <Alert variant="destructive" className="border-amber-500/50 text-amber-600 [&>svg]:text-amber-600">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Acción Requerida: Configura tu Seguridad</AlertTitle>
      <AlertDescription>
        No has configurado tus preguntas de seguridad. Son necesarias para recuperar tu contraseña si la olvidas.
        <Button asChild variant="link" className="p-0 h-auto ml-2 text-amber-700 font-bold">
            <Link href="/settings">
                Configurar ahora
            </Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
