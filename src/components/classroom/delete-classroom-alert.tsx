'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { DropdownMenuItem } from '../ui/dropdown-menu';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteClassroom } from '@/lib/actions/classrooms';
import { useToast } from '@/hooks/use-toast';

interface DeleteClassroomAlertProps {
  classroomId: string;
}

export function DeleteClassroomAlert({ classroomId }: DeleteClassroomAlertProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteClassroom(classroomId);
    if (result.success) {
      toast({
        title: 'Aula Eliminada',
        description: 'El aula ha sido eliminada exitosamente.',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'No se pudo eliminar el aula.',
        variant: 'destructive',
      });
    }
    setIsDeleting(false);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente el aula y todo su horario asociado del sistema.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
