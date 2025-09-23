
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
import { createStudent } from '@/lib/actions/students';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

const studentSchema = z.object({
  // Student Info
  name: z.string().min(1, 'El nombre del estudiante es obligatorio.'),
  dob: z.string().min(1, 'La fecha de nacimiento es obligatoria.'),
  gender: z.string().min(1, 'El género es obligatorio.'),
  avatarUrl: z.union([z.string().url('URL de imagen inválida.'), z.literal('')]).optional(),
  
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
  representativeCi: z.string().min(1, 'La cédula de identidad es obligatoria.'),
  representativeRelation: z.string().min(1, 'La relación con el estudiante es obligatoria.'),
  representativePhone: z.string().min(1, 'El teléfono del representante es obligatorio.'),
  representativeEmail: z.string().email('Correo electrónico de representante inválido.'),
  representativeAddress: z.string().optional(),
  representativePassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});


type StudentFormValues = z.infer<typeof studentSchema>;

export function AddStudentDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
  });

  const onSubmit: SubmitHandler<StudentFormValues> = async (data) => {
    const result = await createStudent(data);
    if (result.success) {
      toast({
        title: 'Estudiante y Representante Creados',
        description: 'El nuevo estudiante y la cuenta de su representante han sido creados exitosamente.',
      });
      reset();
      setOpen(false);
    } else {
        if (result.error && typeof result.error === 'object' && 'representativeEmail' in result.error) {
            setError('representativeEmail', { type: 'manual', message: result.error.representativeEmail?.[0] });
        } else {
            let errorMessage = 'No se pudo añadir al estudiante.';
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
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Añadir Estudiante</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Estudiante</DialogTitle>
          <DialogDescription>
            Completa la información para añadir un nuevo estudiante y crear la cuenta de su representante.
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
                  <Label htmlFor="name">Nombre y Apellido</Label>
                  <Input id="name" {...register('name')} />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
               </div>
                <div>
                  <Label htmlFor="avatarUrl">URL de la Foto de Perfil</Label>
                  <Input id="avatarUrl" placeholder="https://ejemplo.com/imagen.png" {...register('avatarUrl')} />
                  {errors.avatarUrl && <p className="text-sm text-destructive mt-1">{errors.avatarUrl.message}</p>}
               </div>
               <div>
                  <Label htmlFor="dob">Fecha de Nacimiento</Label>
                  <Input id="dob" type="date" {...register('dob')} />
                  {errors.dob && <p className="text-sm text-destructive mt-1">{errors.dob.message}</p>}
               </div>
                <div>
                  <Label htmlFor="gender">Género</Label>
                  <Input id="gender" {...register('gender')} />
                  {errors.gender && <p className="text-sm text-destructive mt-1">{errors.gender.message}</p>}
               </div>
               <h3 className="font-semibold text-lg pt-4">Contacto de Emergencia</h3>
                <div>
                  <Label htmlFor="emergencyContactName">Nombre Completo</Label>
                  <Input id="emergencyContactName" {...register('emergencyContactName')} />
                  {errors.emergencyContactName && <p className="text-sm text-destructive mt-1">{errors.emergencyContactName.message}</p>}
               </div>
                <div>
                  <Label htmlFor="emergencyContactPhone">Número de Teléfono</Label>
                  <Input id="emergencyContactPhone" {...register('emergencyContactPhone')} />
                  {errors.emergencyContactPhone && <p className="text-sm text-destructive mt-1">{errors.emergencyContactPhone.message}</p>}
               </div>
                <div>
                  <Label htmlFor="emergencyContactRelation">Relación con el Estudiante</Label>
                  <Input id="emergencyContactRelation" {...register('emergencyContactRelation')} />
                  {errors.emergencyContactRelation && <p className="text-sm text-destructive mt-1">{errors.emergencyContactRelation.message}</p>}
               </div>
            </TabsContent>

            <TabsContent value="medical-info" className="space-y-4">
                <h3 className="font-semibold text-lg">Información Médica y de Diagnóstico</h3>
                 <div>
                    <Label htmlFor="diagnosis">Diagnóstico (TEA)</Label>
                    <Textarea id="diagnosis" {...register('diagnosis')} />
                    {errors.diagnosis && <p className="text-sm text-destructive mt-1">{errors.diagnosis.message}</p>}
                </div>
                 <div>
                    <Label htmlFor="medicalConditions">Condiciones Médicas o Comorbilidades</Label>
                    <Textarea id="medicalConditions" {...register('medicalConditions')} />
                    {errors.medicalConditions && <p className="text-sm text-destructive mt-1">{errors.medicalConditions.message}</p>}
                </div>
                 <div>
                    <Label htmlFor="medications">Medicamentos Actuales</Label>
                    <Textarea id="medications" {...register('medications')} />
                    {errors.medications && <p className="text-sm text-destructive mt-1">{errors.medications.message}</p>}
                </div>
                 <div>
                    <Label htmlFor="allergies">Alergias</Label>
                    <Textarea id="allergies" {...register('allergies')} />
                    {errors.allergies && <p className="text-sm text-destructive mt-1">{errors.allergies.message}</p>}
                </div>
            </TabsContent>

             <TabsContent value="pedagogical-info" className="space-y-4">
                <h3 className="font-semibold text-lg">Información Pedagógica</h3>
                 <div>
                    <Label htmlFor="gradeLevel">Grado o Nivel Educativo</Label>
                    <Input id="gradeLevel" {...register('gradeLevel')} />
                    {errors.gradeLevel && <p className="text-sm text-destructive mt-1">{errors.gradeLevel.message}</p>}
                </div>
                 <div>
                    <Label htmlFor="specializationArea">Área de Especialización o Grupo</Label>
                    <Input id="specializationArea" {...register('specializationArea')} />
                    {errors.specializationArea && <p className="text-sm text-destructive mt-1">{errors.specializationArea.message}</p>}
                </div>
                 <div>
                    <Label htmlFor="skillsAndInterests">Habilidades e Intereses</Label>
                    <Textarea id="skillsAndInterests" {...register('skillsAndInterests')} />
                    {errors.skillsAndInterests && <p className="text-sm text-destructive mt-1">{errors.skillsAndInterests.message}</p>}
                </div>
                 <div>
                    <Label htmlFor="supportNeeds">Necesidades de Apoyo Específicas</Label>
                    <Textarea id="supportNeeds" {...register('supportNeeds')} />
                    {errors.supportNeeds && <p className="text-sm text-destructive mt-1">{errors.supportNeeds.message}</p>}
                </div>
             </TabsContent>


            <TabsContent value="representative-info" className="space-y-4">
                <h3 className="font-semibold text-lg">Datos del Representante (Padre/Tutor)</h3>
                <div>
                  <Label htmlFor="representativeName">Nombre y Apellido</Label>
                  <Input id="representativeName" {...register('representativeName')} />
                  {errors.representativeName && <p className="text-sm text-destructive mt-1">{errors.representativeName.message}</p>}
               </div>
                <div>
                  <Label htmlFor="representativeCi">Cédula de Identidad</Label>
                  <Input id="representativeCi" placeholder="Ej: V-12345678" {...register('representativeCi')} />
                  {errors.representativeCi && <p className="text-sm text-destructive mt-1">{errors.representativeCi.message}</p>}
               </div>
                <div>
                  <Label htmlFor="representativeRelation">Relación con el Estudiante</Label>
                  <Input id="representativeRelation" {...register('representativeRelation')} />
                  {errors.representativeRelation && <p className="text-sm text-destructive mt-1">{errors.representativeRelation.message}</p>}
               </div>
                 <div>
                  <Label htmlFor="representativePhone">Número de Teléfono</Label>
                  <Input id="representativePhone" type="tel" {...register('representativePhone')} />
                  {errors.representativePhone && <p className="text-sm text-destructive mt-1">{errors.representativePhone.message}</p>}
               </div>
               <div>
                  <Label htmlFor="representativeEmail">Correo Electrónico (para inicio de sesión)</Label>
                  <Input id="representativeEmail" type="email" {...register('representativeEmail')} />
                  {errors.representativeEmail && <p className="text-sm text-destructive mt-1">{errors.representativeEmail.message}</p>}
               </div>
                <div>
                  <Label htmlFor="representativePassword">Contraseña para la Cuenta</Label>
                  <Input id="representativePassword" type="password" {...register('representativePassword')} />
                  {errors.representativePassword && <p className="text-sm text-destructive mt-1">{errors.representativePassword.message}</p>}
               </div>
               <div>
                  <Label htmlFor="representativeAddress">Dirección de Residencia (Opcional)</Label>
                  <Input id="representativeAddress" {...register('representativeAddress')} />
                  {errors.representativeAddress && <p className="text-sm text-destructive mt-1">{errors.representativeAddress.message}</p>}
               </div>
            </TabsContent>
            </div>
            </ScrollArea>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Estudiante
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
