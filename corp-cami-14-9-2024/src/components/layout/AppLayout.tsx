'use server';

import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import Header from './header';
import { getSession } from '@/lib/actions/users';
import type { User } from '@/lib/types';
import { TeacherSidebar } from './teacher-sidebar';
import { RepresentativeSidebar } from './representative-sidebar';
import { redirect } from 'next/navigation';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Nota: usePathname() no funciona en Server Components.
  // La lógica para páginas de autenticación se manejará directamente
  // en las páginas o mediante middleware si es necesario.
  // Por ahora, el chequeo de sesión protege las rutas internas.

  const session = await getSession();

  if (!session?.user) {
    // Si no hay sesión, idealmente deberíamos estar en /login o /register.
    // Si se intenta acceder a una ruta protegida, las páginas mismas
    // o un middleware deberían redirigir. Para este layout, si no hay sesión,
    // no mostramos la estructura principal.
    return <>{children}</>;
  }
  
  const userRole = session.user.role;

  const renderSidebar = () => {
    switch (userRole) {
      case 'admin':
        return <Sidebar />;
      case 'teacher':
        return <TeacherSidebar />;
      case 'representative':
        return <RepresentativeSidebar />;
      default:
        // Este caso no debería ocurrir si hay una sesión válida.
        return null;
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {renderSidebar()}
      <div className="flex flex-col flex-1 md:ml-64">
        <Header />
        <main className="p-4 sm:p-6 lg:p-8 flex-1 pt-20">
          {children}
        </main>
      </div>
    </div>
  );
}
