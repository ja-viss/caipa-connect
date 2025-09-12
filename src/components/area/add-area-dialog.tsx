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
import { useToast } from '@/hooks/use-toast';
import { createArea } from '@/lib/actions/areas';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Textarea } from '../ui/textarea';
import type { Student, Teacher } from '@/lib/types';
import { Checkbox } from '../ui/checkbox';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Guardar Área
    </Button>
  );
}

interface AddAreaDialogProps {
  teachers: Teacher[];
  students: Student[];
}

export function AddAreaDialog({ teachers, students }: AddAreaDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [state, action] = useActionState(createArea, undefined);

  useEffect(() => {
    if (state?.success === false && state.error?.form) {
      toast({
        title: 'Error',
        description: state.error.form[0],
        variant: 'destructive',
      });
    } else if (state?.success === true) {
       toast({
        title: 'Área Creada',
        description: 'La nueva área ha sido creada exitosamente.',
      });
      setOpen(false);
    }
  }, [state, toast]);


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Añadir Área</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Añadir Nueva Área</DialogTitle>
          <DialogDescription>
            Completa la información para crear una nueva área y asignar docentes y estudiantes.
          </DialogDescription>
        </DialogHeader>
        <form action={action}>
          <ScrollArea className="h-[60vh] p-1">
           <div className="space-y-4 px-4">
                <div>
                  <Label htmlFor="name">Nombre del Área</Label>
                  <Input id="name" name="name" required />
                  {state?.error?.name && <p className="text-sm text-destructive mt-1">{state.error.name[0]}</p>}
               </div>
               <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea id="description" name="description" required />
                  {state?.error?.description && <p className="text-sm text-destructive mt-1">{state.error.description[0]}</p>}
               </div>

                <div>
                    <h4 className="font-semibold mb-2">Asignar Docentes</h4>
                    <div className="space-y-2">
                        {teachers.map(teacher => (
                            <div key={teacher.id} className="flex items-center space-x-2">
                                <Checkbox id={`teacher-${teacher.id}`} name="teacherIds" value={teacher.id} />
                                <Label htmlFor={`teacher-${teacher.id}`}>{teacher.fullName}</Label>
                            </div>
                        ))}
                    </div>
                </div>

                 <div>
                    <h4 className="font-semibold mb-2">Asignar Estudiantes</h4>
                    <div className="space-y-2">
                        {students.map(student => (
                            <div key={student.id} className="flex items-center space-x-2">
                                <Checkbox id={`student-${student.id}`} name="studentIds" value={student.id} />
                                <Label htmlFor={`student-${student.id}`}>{student.name}</Label>
                            </div>
                        ))}
                    </div>
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
