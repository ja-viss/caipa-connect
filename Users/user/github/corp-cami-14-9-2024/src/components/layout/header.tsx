
'use client';

import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent
} from '@/components/ui/dropdown-menu';
import {
  PanelLeft,
  Users,
  LayoutDashboard,
  Shield,
  BookOpen,
  Settings,
  Contact,
  Shapes,
  Send,
  Building,
  FileText,
  User,
  LogOut,
  Sun,
  Moon,
  Laptop
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { getSession, logoutUser } from '@/lib/actions/users';
import { useEffect, useState, useMemo } from 'react';
import type { User as UserType } from '@/lib/types';
import { ThemeToggle } from './theme-toggle';


const getNavItemsByRole = (role: UserType['role'] | undefined) => {
    const adminNavItems = [
        { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
        { href: '/students', label: 'Estudiantes', icon: Users },
        { href: '/resources', label: 'Recursos', icon: BookOpen },
        { isSeparator: true },
        { title: 'Admin' },
        { href: '/admin/users', label: 'Gestión de Usuarios', icon: Shield },
        { href: '/messages', label: 'Mensajería', icon: Send },
        { href: '/admin/classrooms', label: 'Aulas', icon: Building },
        { href: '/admin/teachers', label: 'Docentes', icon: Contact },
        { href: '/admin/areas', label: 'Áreas', icon: Shapes },
        { href: '/reports', label: 'Generar Informes', icon: FileText },
    ];

    const teacherNavItems = [
        { href: '/teacher/dashboard', label: 'Panel', icon: LayoutDashboard },
        { href: '/teacher/students', label: 'Mis Estudiantes', icon: Users },
        { href: '/teacher/areas-classrooms', label: 'Áreas y Aulas', icon: Building },
        { href: '/reports', label: 'Generar Informes', icon: FileText },
        { href: '/resources', label: 'Recursos', icon: BookOpen },
        { href: '/messages', label: 'Mensajería', icon: Send },
    ];

    const representativeNavItems = [
        { href: '/representative/dashboard', label: 'Panel', icon: LayoutDashboard },
        { href: '/representative/student', label: 'Mi Estudiante', icon: User },
        { href: '/representative/areas-teachers', label: 'Áreas y Docentes', icon: Shapes },
        { href: '/representative/reports', label: 'Informes', icon: FileText },
        { href: '/resources', label: 'Recursos', icon: BookOpen },
        { href: '/representative/messages', label: 'Mensajes', icon: Send, badge: false },
    ];

    switch (role) {
        case 'admin':
            return adminNavItems;
        case 'teacher':
            return teacherNavItems;
        case 'representative':
            return representativeNavItems;
        default:
            return [];
    }
}


export default function Header() {
  const [session, setSession] = useState<{ user: UserType } | null>(null);

  useEffect(() => {
    getSession().then(setSession);
  }, []);

  const userName = session?.user?.fullName || 'Usuario';
  const userInitials = userName.split(' ').map(n => n[0]).join('');
  const navItems = useMemo(() => getNavItemsByRole(session?.user?.role), [session?.user?.role]);
  const homeLink = session?.user?.role === 'teacher' ? '/teacher/dashboard' : session?.user?.role === 'representative' ? '/representative/dashboard' : '/dashboard';

  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="md:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Alternar Menú</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
           <SheetHeader>
                <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
           </SheetHeader>
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href={homeLink}
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 transition-all group-hover:scale-110"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              <span className="sr-only">CAIPA Connect</span>
            </Link>
            {navItems.map((item, index) => {
              if (item.isSeparator) {
                return <hr key={`sep-${index}`} className="my-2 border-border" />;
              }
              if (item.title) {
                 return <p key={`title-${index}`} className="px-2.5 text-sm font-semibold text-muted-foreground">{item.title}</p>
              }
              if (!item.href || !item.icon) return null;
              return (
                 <Link key={item.href} href={item.href} className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                    <item.icon className="h-5 w-5" />
                    {item.label}
                </Link>
              )
            })}
             <hr className="my-2 border-border" />
             <Link href="/settings" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                <Settings className="h-5 w-5" />
                Configuración
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      
      <div className="ml-auto flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
              <Avatar>
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{userName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">Configuración</Link>
            </DropdownMenuItem>
            <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                    <span>Tema</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                        <ThemeToggle />
                    </DropdownMenuSubContent>
                </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuItem>Soporte</DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action={logoutUser}>
              <button type="submit" className="w-full">
                  <DropdownMenuItem>
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                  </DropdownMenuItem>
              </button>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
