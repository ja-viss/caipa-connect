'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { updateStudent } from '@/lib/actions/students';
import { Loader2, Pencil } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import type { Student } from '@/lib/types';
import { DropdownMenuItem } from '../ui/dropdown-menu';

const studentSchema = z.object({
  // Student Info
  name: z.string().min(1, 'El nombre del estudiante es obligatorio.'),
  dob: z.string().min(1, 'La fecha de nacimiento es obligatoria.'),
  gender: z.string().min(1, 'El género es obligatorio.'),
  
  // Emergency Contact
  emergencyContactName: z.string().min(1, 'El nombre del contacto de emergencia es obligatorio.'),
  emergencyContactPhone: z.string().min(1, 'El teléfono del contacto de emergencia es obligatorio.'),
  emergencyContactRelation: z.string().min(1, 'La relación del contacto de emergencia es obligatoria.'),
  
  // Medical Info
  diagnosis: z.string().min(1, 'El diagnóstico es obligatorio.'),
  medicalConditions: z.string().min(1, 'Las condiciones médicas son obligatorias.'),
  medications: z.string().min(1, 'Los medicamentos son obligatorios.'),
  allergies: z.string().min(1, 'Las alergias son obligatorias.'),
  
  // Pedagogical Info
  gradeLevel: z.string().min(1, 'El nivel educativo es obligatorio.'),
  specializationArea: z.string().min(1, 'El área de especialización es obligatoria.'),
  skillsAndInterests: z.string().min(1, 'Las habilidades e intereses son obligatorios.'),
  supportNeeds: z.string().min(1, 'Las necesidades de apoyo son obligatorias.'),
  
  // Representative Info
  representativeName: z.string().min(1, 'El nombre del representante es obligatorio.'),
  representativeCi: z.string().regex(/^\d+$/, 'La cédula de identidad solo debe contener números.').min(1, 'La cédula de identidad es obligatoria.'),
  representativeRelation: z.string().min(1, 'La relación con el estudiante es obligatoria.'),
  representativePhone: z.string().min(1, 'El teléfono del representante es obligatorio.'),
  representativeEmail: z.string().email('Correo electrónico de representante inválido.'),
  representativeAddress: z.string().optional(),
  representativePassword: z.string().optional(),
});


type StudentFormValues = z.infer<typeof studentSchema>;

interface EditStudentDialogProps {
  student: Student;
  asDropdownItem?: boolean;
}

export function EditStudentDialog({ student, asDropdownItem = false }: EditStudentDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: student.name,
      dob: student.dob,
      gender: student.gender,
      emergencyContactName: student.emergencyContact.name,
      emergencyContactPhone: student.emergencyContact.phone,
      emergencyContactRelation: student.emergencyContact.relation,
      diagnosis: student.medicalInfo.diagnosis,
      medicalConditions: student.medicalInfo.conditions,
      medications: student.medicalInfo.medications,
      allergies: student.medicalInfo.allergies,
      gradeLevel: student.pedagogicalInfo.gradeLevel,
      specializationArea: student.pedagogicalInfo.specializationArea,
      skillsAndInterests: student.pedagogicalInfo.skillsAndInterests,
      supportNeeds: student.pedagogicalInfo.supportNeeds,
      representativeName: student.representative.name,
      representativeCi: student.representative.ci,
      representativeRelation: student.representative.relation,
      representativePhone: student.representative.phone,
      representativeEmail: student.representative.email,
      representativeAddress: student.representative.address,
    },
  });

  const onSubmit: SubmitHandler<StudentFormValues> = async (data) => {
    const result = await updateStudent(student.id, data);
    if (result.success) {
      toast({
        title: 'Estudiante Actualizado',
        description: 'La información del estudiante ha sido actualizada exitosamente.',
      });
      setOpen(false);
    } else {
      let errorMessage = 'No se pudo actualizar la información del estudiante.';
      if (result.error instanceof z.ZodError) {
        errorMessage = result.error.errors.map(e => e.message).join(', ');
      } else if (typeof result.error === 'string') {
        errorMessage = result.error;
      }
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {asDropdownItem ? (
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
        ) : (
          <Button>
            <Pencil className="mr-2 h-4 w-4" />
            Editar Información
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Editar Información del Estudiante</DialogTitle>
          <DialogDescription>
            Actualiza la información del estudiante. Haz clic en guardar cuando termines.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs defaultValue="student-info" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="student-info">Estudiante</TabsTrigger>
              <TabsTrigger value="medical-info">Info. Médica</TabsTrigger>
              <TabsTrigger value="pedagogical-info">Info. Pedagógica</TabsTrigger>
              <TabsTrigger value="representative-info">Representante</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[60vh] md:h-[50vh] mt-4">
            <div className="px-1 sm:px-4">
            <TabsContent value="student-info" className="space-y-4">
              <h3 className="font-semibold text-lg">Información Básica</h3>
               <div>
                  <Label htmlFor="name-edit">Nombre y Apellido</Label>
                  <Input id="name-edit" {...register('name')} />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
               </div>
               <div>
                  <Label htmlFor="dob-edit">Fecha de Nacimiento</Label>
                  <Input id="dob-edit" type="date" {...register('dob')} />
                  {errors.dob && <p className="text-sm text-destructive mt-1">{errors.dob.message}</p>}
               </div>
                <div>
                  <Label htmlFor="gender-edit">Género</Label>
                  <Input id="gender-edit" {...register('gender')} />
                  {errors.gender && <p className="text-sm text-destructive mt-1">{errors.gender.message}</p>}
               </div>
               <h3 className="font-semibold text-lg pt-4">Contacto de Emergencia</h3>
                <div>
                  <Label htmlFor="emergencyContactName-edit">Nombre Completo</Label>
                  <Input id="emergencyContactName-edit" {...register('emergencyContactName')} />
                  {errors.emergencyContactName && <p className="text-sm text-destructive mt-1">{errors.emergencyContactName.message}</p>}
               </div>
                <div>
                  <Label htmlFor="emergencyContactPhone-edit">Número de Teléfono</Label>
                  <Input id="emergencyContactPhone-edit" {...register('emergencyContactPhone')} />
                  {errors.emergencyContactPhone && <p className="text-sm text-destructive mt-1">{errors.emergencyContactPhone.message}</p>}
               </div>
                <div>
                  <Label htmlFor="emergencyContactRelation-edit">Relación con el Estudiante</Label>
                  <Input id="emergencyContactRelation-edit" {...register('emergencyContactRelation')} />
                  {errors.emergencyContactRelation && <p className="text-sm text-destructive mt-1">{errors.emergencyContactRelation.message}</p>}
               </div>
            </TabsContent>

            <TabsContent value="medical-info" className="space-y-4">
                <h3 className="font-semibold text-lg">Información Médica y de Diagnóstico</h3>
                 <div>
                    <Label htmlFor="diagnosis-edit">Diagnóstico (TEA)</Label>
                    <Textarea id="diagnosis-edit" {...register('diagnosis')} />
                    {errors.diagnosis && <p className="text-sm text-destructive mt-1">{errors.diagnosis.message}</p>}
                </div>
                 <div>
                    <Label htmlFor="medicalConditions-edit">Condiciones Médicas o Comorbilidades</Label>
                    <Textarea id="medicalConditions-edit" {...register('medicalConditions')} />
                    {errors.medicalConditions && <p className="text-sm text-destructive mt-1">{errors.medicalConditions.message}</p>}
                </div>
                 <div>
                    <Label htmlFor="medications-edit">Medicamentos Actuales</Label>
                    <Textarea id="medications-edit" {...register('medications')} />
                    {errors.medications && <p className="text-sm text-destructive mt-1">{errors.medications.message}</p>}
                </div>
                 <div>
                    <Label htmlFor="allergies-edit">Alergias</Label>
                    <Textarea id="allergies-edit" {...register('allergies')} />
                    {errors.allergies && <p className="text-sm text-destructive mt-1">{errors.allergies.message}</p>}
                </div>
            </TabsContent>

             <TabsContent value="pedagogical-info" className="space-y-4">
                <h3 className="font-semibold text-lg">Información Pedagógica</h3>
                 <div>
                    <Label htmlFor="gradeLevel-edit">Grado o Nivel Educativo</Label>
                    <Input id="gradeLevel-edit" {...register('gradeLevel')} />
                    {errors.gradeLevel && <p className="text-sm text-destructive mt-1">{errors.gradeLevel.message}</p>}
                </div>
                 <div>
                    <Label htmlFor="specializationArea-edit">Área de Especialización o Grupo</Label>
                    <Input id="specializationArea-edit" {...register('specializationArea')} />
                    {errors.specializationArea && <p className="text-sm text-destructive mt-1">{errors.specializationArea.message}</p>}
                </div>
                 <div>
                    <Label htmlFor="skillsAndInterests-edit">Habilidades e Intereses</Label>
                    <Textarea id="skillsAndInterests-edit" {...register('skillsAndInterests')} />
                    {errors.skillsAndInterests && <p className="text-sm text-destructive mt-1">{errors.skillsAndInterests.message}</p>}
                </div>
                 <div>
                    <Label htmlFor="supportNeeds-edit">Necesidades de Apoyo Específicas</Label>
                    <Textarea id="supportNeeds-edit" {...register('supportNeeds')} />
                    {errors.supportNeeds && <p className="text-sm text-destructive mt-1">{errors.supportNeeds.message}</p>}
                </div>
             </TabsContent>


            <TabsContent value="representative-info" className="space-y-4">
                <h3 className="font-semibold text-lg">Datos del Representante (Padre/Tutor)</h3>
                <div>
                  <Label htmlFor="representativeName-edit">Nombre y Apellido</Label>
                  <Input id="representativeName-edit" {...register('representativeName')} />
                  {errors.representativeName && <p className="text-sm text-destructive mt-1">{errors.representativeName.message}</p>}
               </div>
               <div>
                  <Label htmlFor="representativeCi-edit">Cédula de Identidad</Label>
                  <Input id="representativeCi-edit" {...register('representativeCi')} />
                  {errors.representativeCi && <p className="text-sm text-destructive mt-1">{errors.representativeCi.message}</p>}
               </div>
                <div>
                  <Label htmlFor="representativeRelation-edit">Relación con el Estudiante</Label>
                  <Input id="representativeRelation-edit" {...register('representativeRelation')} />
                  {errors.representativeRelation && <p className="text-sm text-destructive mt-1">{errors.representativeRelation.message}</p>}
               </div>
                 <div>
                  <Label htmlFor="representativePhone-edit">Número de Teléfono</Label>
                  <Input id="representativePhone-edit" type="tel" {...register('representativePhone')} />
                  {errors.representativePhone && <p className="text-sm text-destructive mt-1">{errors.representativePhone.message}</p>}
               </div>
               <div>
                  <Label htmlFor="representativeEmail-edit">Correo Electrónico</Label>
                  <Input id="representativeEmail-edit" type="email" {...register('representativeEmail')} />
                  {errors.representativeEmail && <p className="text-sm text-destructive mt-1">{errors.representativeEmail.message}</p>}
               </div>
                <div>
                    <Label htmlFor="representativePassword-edit">Nueva Contraseña</Label>
                    <Input id="representativePassword-edit" type="password" {...register('representativePassword')} />
                    <p className="text-xs text-muted-foreground mt-1">Dejar en blanco para no cambiar la contraseña.</p>
                    {errors.representativePassword && <p className="text-sm text-destructive mt-1">{errors.representativePassword.message}</p>}
                </div>
               <div>
                  <Label htmlFor="representativeAddress-edit">Dirección de Residencia (Opcional)</Label>
                  <Input id="representativeAddress-edit" {...register('representativeAddress')} />
                  {errors.representativeAddress && <p className="text-sm text-destructive mt-1">{errors.representativeAddress.message}</p>}
               </div>
            </TabsContent>
            </div>
            </ScrollArea>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
