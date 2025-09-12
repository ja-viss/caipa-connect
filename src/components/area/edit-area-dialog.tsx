'use client';

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
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
import { updateArea } from '@/lib/actions/areas';
import { Loader2, Pencil } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Textarea } from '../ui/textarea';
import type { Area, Student, Teacher } from '@/lib/types';
import { Checkbox } from '../ui/checkbox';
import { DropdownMenuItem } from '../ui/dropdown-menu';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Guardar Cambios
    </Button>
  );
}

interface EditAreaDialogProps {
  area: Area;
  allTeachers: Teacher[];
  allStudents: Student[];
}

export function EditAreaDialog({ area, allTeachers, allStudents }: EditAreaDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const updateAreaWithId = updateArea.bind(null, area.id);
  const [state, action] = useFormState(updateAreaWithId, undefined);

  useEffect(() => {
    if (state?.success === false && state.error?.form) {
      toast({
        title: 'Error',
        description: state.error.form[0],
        variant: 'destructive',
      });
    } else if (state?.success === true) {
       toast({
        title: 'Área Actualizada',
        description: 'El área ha sido actualizada exitosamente.',
      });
      setOpen(false);
    }
  }, [state, toast]);


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
         <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Área</DialogTitle>
          <DialogDescription>
            Actualiza la información y las asignaciones del área.
          </DialogDescription>
        </DialogHeader>
        <form action={action}>
          <ScrollArea className="h-[60vh] p-1">
           <div className="space-y-4 px-4">
                <div>
                  <Label htmlFor={`name-${area.id}`}>Nombre del Área</Label>
                  <Input id={`name-${area.id}`} name="name" defaultValue={area.name} required />
                  {state?.error?.name && <p className="text-sm text-destructive mt-1">{state.error.name[0]}</p>}
               </div>
               <div>
                  <Label htmlFor={`description-${area.id}`}>Descripción</Label>
                  <Textarea id={`description-${area.id}`} name="description" defaultValue={area.description} required />
                  {state?.error?.description && <p className="text-sm text-destructive mt-1">{state.error.description[0]}</p>}
               </div>

                <div>
                    <h4 className="font-semibold mb-2">Asignar Docentes</h4>
                    <div className="space-y-2">
                        {allTeachers.map(teacher => (
                            <div key={teacher.id} className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`edit-teacher-${area.id}-${teacher.id}`} 
                                  name="teacherIds" 
                                  value={teacher.id}
                                  defaultChecked={area.teacherIds?.includes(teacher.id)}
                                 />
                                <Label htmlFor={`edit-teacher-${area.id}-${teacher.id}`}>{teacher.fullName}</Label>
                            </div>
                        ))}
                    </div>
                </div>

                 <div>
                    <h4 className="font-semibold mb-2">Asignar Estudiantes</h4>
                    <div className="space-y-2">
                        {allStudents.map(student => (
                            <div key={student.id} className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`edit-student-${area.id}-${student.id}`} 
                                  name="studentIds" 
                                  value={student.id}
                                  defaultChecked={area.studentIds?.includes(student.id)}
                                />
                                <Label htmlFor={`edit-student-${area.id}-${student.id}`}>{student.name}</Label>
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
