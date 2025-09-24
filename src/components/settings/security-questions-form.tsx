'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import type { SecurityQuestion } from '@/lib/types';
import { saveSecurityQuestions } from '@/lib/actions/users';

const PREDEFINED_QUESTIONS = [
  "¿Cuál es el nombre de tu primera mascota?",
  "¿En qué ciudad naciste?",
  "¿Cuál es tu comida favorita?",
  "¿Cuál es el nombre de soltera de tu madre?",
  "¿Cuál fue tu primer colegio?",
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Guardar Preguntas
    </Button>
  );
}

interface SecurityQuestionsFormProps {
  securityQuestions: SecurityQuestion[];
}

export function SecurityQuestionsForm({ securityQuestions }: SecurityQuestionsFormProps) {
  const { toast } = useToast();
  const [state, action] = useActionState(saveSecurityQuestions, undefined);
  const [showAnswer1, setShowAnswer1] = useState(false);
  const [showAnswer2, setShowAnswer2] = useState(false);

  useEffect(() => {
    if (state?.success) {
      toast({ title: 'Éxito', description: state.message });
    } else if (state?.error) {
      toast({ title: 'Error', description: state.error, variant: 'destructive' });
    }
  }, [state, toast]);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="question1">Pregunta 1</Label>
        <select
          id="question1"
          name="question1"
          defaultValue={securityQuestions[0]?.question}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {PREDEFINED_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
        </select>
        <div className="relative">
            <Input
              name="answer1"
              placeholder="Respuesta 1"
              type={showAnswer1 ? 'text' : 'password'}
              defaultValue={securityQuestions[0]?.answer}
              required
            />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute inset-y-0 right-0 h-full px-3"
                onClick={() => setShowAnswer1(!showAnswer1)}
            >
                {showAnswer1 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="question2">Pregunta 2</Label>
        <select
          id="question2"
          name="question2"
          defaultValue={securityQuestions[1]?.question}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {PREDEFINED_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
        </select>
         <div className="relative">
            <Input
              name="answer2"
              placeholder="Respuesta 2"
              type={showAnswer2 ? 'text' : 'password'}
              defaultValue={securityQuestions[1]?.answer}
              required
            />
             <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute inset-y-0 right-0 h-full px-3"
                onClick={() => setShowAnswer2(!showAnswer2)}
            >
                {showAnswer2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
        </div>
      </div>
      <SubmitButton />
    </form>
  );
}