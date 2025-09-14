'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, User, Shapes, Contact, FileText, BookOpen, Send, Settings } from 'lucide-react';

export function RepresentativeSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/representative/dashboard', label: 'Panel', icon: LayoutDashboard },
    { href: '/representative/student', label: 'Mi Estudiante', icon: User },
    { href: '/representative/areas-teachers', label: 'Áreas y Docentes', icon: Shapes },
    { href: '/representative/reports', label: 'Informes', icon: FileText },
    { href: '/resources', label: 'Recursos', icon: BookOpen },
    { href: '/representative/messages', label: 'Mensajes', icon: Send },
  ];

  const isNavItemActive = (href: string) => {
    return pathname === href;
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r fixed h-full">
      <div className="flex items-center h-16 px-6 border-b">
        <Link href="/representative/dashboard" className="flex items-center gap-2 font-semibold text-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6 text-primary"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <span>CAIPA Connect</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="flex flex-col p-4 gap-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted/50',
                isNavItemActive(item.href) && 'bg-muted text-primary font-semibold'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
       <div className="mt-auto p-4 border-t">
         <Link
              href="/settings"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted/50',
                pathname.startsWith('/settings') && 'bg-muted text-primary font-semibold'
              )}
            >
              <Settings className="h-4 w-4" />
              Configuración
            </Link>
      </div>
    </aside>
  );
}
