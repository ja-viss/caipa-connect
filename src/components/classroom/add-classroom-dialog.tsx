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
import { createClassroom } from '@/lib/actions/classrooms';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import type { Area, ScheduleEntry } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Guardar Aula
    </Button>
  );
}

interface AddClassroomDialogProps {
  areas: Area[];
}

const emptySchedule: Omit<ScheduleEntry, 'id'> = { day: 'Lunes', startTime: '', endTime: '', areaId: '' };

export function AddClassroomDialog({ areas }: AddClassroomDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [state, action] = useActionState(createClassroom, undefined);
  const [schedule, setSchedule] = useState<Omit<ScheduleEntry, 'id'>[]>([emptySchedule]);

  useEffect(() => {
    if (state?.success === false) {
      const errorMsg = state.error?.form?.[0] || 'Por favor, revisa los campos.';
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } else if (state?.success === true) {
       toast({
        title: 'Aula Creada',
        description: 'La nueva aula ha sido creada exitosamente.',
      });
      setSchedule([emptySchedule]);
      setOpen(false);
    }
  }, [state, toast]);

  const handleScheduleChange = (index: number, field: keyof Omit<ScheduleEntry, 'id'>, value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setSchedule(newSchedule);
  };

  const addScheduleSlot = () => {
    setSchedule([...schedule, emptySchedule]);
  };
  
  const removeScheduleSlot = (index: number) => {
    const newSchedule = schedule.filter((_, i) => i !== index);
    setSchedule(newSchedule);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Añadir Aula</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Añadir Nueva Aula</DialogTitle>
          <DialogDescription>
            Completa la información para crear una nueva aula y su horario.
          </DialogDescription>
        </DialogHeader>
        <form action={action}>
          <input type="hidden" name="schedule" value={JSON.stringify(schedule)} />
          <ScrollArea className="h-[60vh] p-1">
           <div className="space-y-4 px-4">
                <div>
                  <Label htmlFor="name">Nombre o Número del Aula</Label>
                  <Input id="name" name="name" required />
                  {state?.error?.name && <p className="text-sm text-destructive mt-1">{state.error.name[0]}</p>}
               </div>
               <div>
                  <Label htmlFor="building">Edificio o Ubicación</Label>
                  <Input id="building" name="building" required />
                  {state?.error?.building && <p className="text-sm text-destructive mt-1">{state.error.building[0]}</p>}
               </div>

                <div className="space-y-4">
                    <h4 className="font-semibold mb-2">Horario</h4>
                    {schedule.map((entry, index) => (
                        <div key={index} className="p-4 border rounded-md space-y-4 relative">
                           {schedule.length > 1 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-6 w-6"
                                onClick={() => removeScheduleSlot(index)}
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                           )}
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label>Día de la Semana</Label>
                                     <Select
                                        value={entry.day}
                                        onValueChange={(value) => handleScheduleChange(index, 'day', value)}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Lunes">Lunes</SelectItem>
                                            <SelectItem value="Martes">Martes</SelectItem>
                                            <SelectItem value="Miércoles">Miércoles</SelectItem>
                                            <SelectItem value="Jueves">Jueves</SelectItem>
                                            <SelectItem value="Viernes">Viernes</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Área</Label>
                                    <Select
                                        value={entry.areaId}
                                        onValueChange={(value) => handleScheduleChange(index, 'areaId', value)}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Seleccionar área" /></SelectTrigger>
                                        <SelectContent>
                                            {areas.map(area => (
                                                <SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Hora de Inicio</Label>
                                    <Input 
                                      type="time" 
                                      value={entry.startTime}
                                      onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>Hora de Fin</Label>
                                    <Input 
                                      type="time" 
                                      value={entry.endTime}
                                      onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                                     />
                                </div>
                           </div>
                        </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addScheduleSlot}>
                        <Plus className="mr-2 h-4 w-4" /> Añadir Horario
                    </Button>
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
