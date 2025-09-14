'use server';

import { Sidebar } from './sidebar';
import Header from './header';
import { getSession } from '@/lib/actions/users';
import { TeacherSidebar } from './teacher-sidebar';
import { RepresentativeSidebar } from './representative-sidebar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Si no hay sesión de usuario, no se renderiza el layout principal.
  // Las páginas como /login y /register se mostrarán directamente.
  // Las páginas protegidas deberían tener su propia lógica de redirección si se accede sin sesión.
  if (!session?.user) {
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
