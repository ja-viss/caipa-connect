import { getSession } from "@/lib/actions/users";
import { redirect } from "next/navigation";
import { UserProfileForm } from "@/components/settings/user-profile-form";
import { TeacherProfileForm } from "@/components/settings/teacher-profile-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getTeacherById } from "@/lib/actions/teachers";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session?.user) {
    redirect('/login');
  }

  const { user } = session;
  const teacher = user.role === 'teacher' && user.teacherId ? await getTeacherById(user.teacherId) : null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configuración de la Cuenta</h1>
        <p className="text-muted-foreground">Gestiona tu información personal y de perfil.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mi Perfil de Usuario</CardTitle>
            <CardDescription>Actualiza tu nombre y contraseña.</CardDescription>
          </CardHeader>
          <CardContent>
            <UserProfileForm user={user} />
          </CardContent>
        </Card>

        {user.role === 'teacher' && teacher && (
          <Card>
            <CardHeader>
              <CardTitle>Perfil de Docente</CardTitle>
              <CardDescription>Actualiza tu información profesional.</CardDescription>
            </CardHeader>
            <CardContent>
              <TeacherProfileForm teacher={teacher} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
