'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import Header from './header';
import { useEffect, useState } from 'react';
import { getSession } from '@/lib/actions/users';
import type { User } from '@/lib/types';
import { TeacherSidebar } from './teacher-sidebar';
import { RepresentativeSidebar } from './representative-sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [session, setSession] = useState<{ user: User } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSession().then((sessionData) => {
      setSession(sessionData);
      setLoading(false);
    });
  }, []);

  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
    );
  }
  
  const userRole = session?.user?.role;

  const renderSidebar = () => {
    switch (userRole) {
      case 'admin':
        return <Sidebar />;
      case 'teacher':
        return <TeacherSidebar />;
      case 'representative':
        return <RepresentativeSidebar />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {renderSidebar()}
      <div className="flex flex-1 flex-col md:pl-64">
        <Header />
        <main className="flex-1 pt-16 px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
