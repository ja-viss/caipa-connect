'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const activityLogSchema = z.object({
  achievements: z.string().min(1, 'Los logros son obligatorios.'),
  challenges: z.string().min(1, 'Los desafíos son obligatorios.'),
  observations: z.string().min(1, 'Las observaciones son obligatorias.'),
});

type ActivityLogFormValues = z.infer<typeof activityLogSchema>;

interface ActivityLoggerProps {
  studentId: string;
}

export default function ActivityLogger({ studentId }: ActivityLoggerProps) {
  const { toast } = useToast();
  const form = useForm<ActivityLogFormValues>({
    resolver: zodResolver(activityLogSchema),
    defaultValues: {
      achievements: '',
      challenges: '',
      observations: '',
    },
  });

  const onSubmit = (data: ActivityLogFormValues) => {
    // Here you would typically call a server action to save the log
    console.log('Nuevo registro para el estudiante', studentId, data);
    toast({
      title: 'Actividad Registrada',
      description: 'La nueva actividad ha sido guardada exitosamente.',
    });
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="achievements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logros</FormLabel>
              <FormControl>
                <Textarea placeholder="Describa los logros del estudiante..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="challenges"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Desafíos</FormLabel>
              <FormControl>
                <Textarea placeholder="Describa los desafíos del estudiante..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="observations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observaciones</FormLabel>
              <FormControl>
                <Textarea placeholder="Anote cualquier otra observación..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit">Registrar Actividad</Button>
        </div>
      </form>
    </Form>
  );
}
