
'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import Header from './header';
import { useEffect, useState } from 'react';
import { getSession } from '@/lib/actions/users';
import type { User } from '@/lib/types';
import { TeacherSidebar } from './teacher-sidebar';
import { RepresentativeSidebar } from './representative-sidebar';
import { cn } from '@/lib/utils';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [session, setSession] = useState<{ user: User } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

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
      <div 
        className="flex flex-col w-full md:ml-64 relative"
        onMouseLeave={() => setIsHeaderVisible(false)}
      >
        <div 
            className="absolute top-0 left-0 right-0 h-8 z-40"
            onMouseEnter={() => setIsHeaderVisible(true)}
        />
        <Header isVisible={isHeaderVisible} />
        <main className={cn(
            "p-4 sm:p-6 lg:p-8 flex-1 transition-all duration-300",
            isHeaderVisible ? 'pt-20' : 'pt-4'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

