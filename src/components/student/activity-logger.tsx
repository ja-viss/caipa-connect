'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const activityLogSchema = z.object({
  achievements: z.string().min(1, 'Achievements are required.'),
  challenges: z.string().min(1, 'Challenges are required.'),
  observations: z.string().min(1, 'Observations are required.'),
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
    console.log('New log for student', studentId, data);
    toast({
      title: 'Activity Logged',
      description: 'The new activity has been saved successfully.',
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
              <FormLabel>Achievements</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the student's achievements..." {...field} />
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
              <FormLabel>Challenges</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the student's challenges..." {...field} />
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
              <FormLabel>Observations</FormLabel>
              <FormControl>
                <Textarea placeholder="Note any other observations..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit">Log Activity</Button>
        </div>
      </form>
    </Form>
  );
}
