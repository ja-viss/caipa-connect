'use client';

import { useEffect, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { sendMessage } from '@/lib/actions/messages';
import { Loader2, Send, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { Teacher, Student } from '@/lib/types';
import { handleGenerateDraft } from '@/app/actions';
import { ScrollArea } from '../ui/scroll-area';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Enviar Mensaje
    </Button>
  );
}

interface ComposeMessageDialogProps {
  teachers: Teacher[];
  representatives: Student['representative'][];
}

export function ComposeMessageDialog({ teachers, representatives }: ComposeMessageDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [state, action] = useActionState(sendMessage, undefined);
  
  const [recipientType, setRecipientType] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => {
    if (state?.success === false && state.error?.form) {
      toast({
        title: 'Error',
        description: state.error.form[0],
        variant: 'destructive',
      });
    } else if (state?.success === true) {
      toast({
        title: 'Mensaje Enviado',
        description: 'El mensaje ha sido enviado exitosamente.',
      });
      resetForm();
      setOpen(false);
    }
  }, [state, toast]);
  
  const resetForm = () => {
    setRecipientType('');
    setSubject('');
    setBody('');
    setTopic('');
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        resetForm();
    }
    setOpen(isOpen);
  }

  const handleGenerate = async () => {
    if (!topic) {
        toast({ title: 'Error', description: 'Por favor, introduce un tema para generar el borrador.', variant: 'destructive' });
        return;
    }
    setIsGenerating(true);
    const result = await handleGenerateDraft(topic);
    if (result.success && result.draft) {
        setSubject(result.draft.subject);
        setBody(result.draft.body);
        toast({ title: 'Borrador Generado', description: 'El borrador ha sido generado por la IA.' });
    } else {
        toast({ title: 'Error', description: result.error || 'No se pudo generar el borrador.', variant: 'destructive' });
    }
    setIsGenerating(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Send className="mr-2 h-4 w-4" />
          Redactar Mensaje
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Redactar Nuevo Mensaje</DialogTitle>
          <DialogDescription>
            Selecciona el destinatario y escribe tu mensaje, o genera un borrador con IA.
          </DialogDescription>
        </DialogHeader>
        <form action={action}>
            <ScrollArea className="h-[60vh] p-1">
                <div className="space-y-4 px-4">
                    <div className="space-y-2">
                        <Label htmlFor="ai-topic">Tema para IA (Opcional)</Label>
                        <div className="flex gap-2">
                            <Input 
                                id="ai-topic" 
                                placeholder="Ej: Anuncio de reunión de padres"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                            />
                            <Button type="button" variant="outline" onClick={handleGenerate} disabled={isGenerating}>
                            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            <span className="sr-only">Generar Borrador</span>
                            </Button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="recipientType">Destinatario</Label>
                            <Select name="recipientType" onValueChange={setRecipientType} required>
                                <SelectTrigger id="recipientType">
                                    <SelectValue placeholder="Seleccionar destinatario..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all-teachers">Todos los Docentes</SelectItem>
                                    <SelectItem value="all-reps">Todos los Representantes</SelectItem>
                                    <SelectItem value="teacher">Un Docente Específico</SelectItem>
                                    <SelectItem value="rep">Un Representante Específico</SelectItem>
                                </SelectContent>
                            </Select>
                            {state?.error?.recipientType && <p className="text-sm text-destructive mt-1">{state.error.recipientType[0]}</p>}
                        </div>
                        {(recipientType === 'teacher' || recipientType === 'rep') && (
                            <div>
                                <Label htmlFor="recipientId">Seleccionar Específico</Label>
                                <Select name="recipientId" required>
                                    <SelectTrigger id="recipientId">
                                        <SelectValue placeholder={`Seleccionar ${recipientType === 'teacher' ? 'docente' : 'representante'}...`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {recipientType === 'teacher' && teachers.map(t => (
                                            <SelectItem key={t.id} value={t.id}>{t.fullName}</SelectItem>
                                        ))}
                                        {recipientType === 'rep' && representatives.map(r => (
                                            <SelectItem key={r.email} value={r.email}>{r.name} ({r.email})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="subject">Asunto</Label>
                        <Input id="subject" name="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
                        {state?.error?.subject && <p className="text-sm text-destructive mt-1">{state.error.subject[0]}</p>}
                    </div>
                    <div>
                        <Label htmlFor="body">Mensaje</Label>
                        <Textarea id="body" name="body" rows={8} value={body} onChange={(e) => setBody(e.target.value)} required />
                        {state?.error?.body && <p className="text-sm text-destructive mt-1">{state.error.body[0]}</p>}
                    </div>
                </div>
          </ScrollArea>
          <DialogFooter className="pt-4 pr-4">
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
