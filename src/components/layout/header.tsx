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
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  PanelLeft,
  Search,
  Users,
  MessageSquare,
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
  Circle,
  LogOut
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getSession, logoutUser } from '@/lib/actions/users';
import { useEffect, useState } from 'react';
import type { User as UserType } from '@/lib/types';


const getNavItemsByRole = (role: UserType['role'] | undefined) => {
    const baseNavItems = [
        { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
        { href: '/students', label: 'Estudiantes', icon: Users },
        { href: '/resources', label: 'Recursos', icon: BookOpen },
    ];
    
    const adminNavItems = [
        ...baseNavItems,
        { isSeparator: true },
        { title: 'Admin' },
        { href: '/admin/users', label: 'Gestión de Usuarios', icon: Shield },
        { href: '/messages', label: 'Mensajería', icon: Send },
        { href: '/admin/classrooms', label: 'Aulas', icon: Users },
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
        { href: '/representative/messages', label: 'Mensajes', icon: Send, badge: false }, // Badge logic can be added here if needed
    ];

    switch (role) {
        case 'admin':
            return adminNavItems;
        case 'teacher':
            return teacherNavItems;
        case 'representative':
            return representativeNavItems;
        default:
            return []; // Return no items if role is unknown or not available
    }
}


export default function Header() {
  const [session, setSession] = useState<{ user: UserType } | null>(null);

  useEffect(() => {
    getSession().then(setSession);
  }, []);

  const userName = session?.user?.fullName || 'Usuario';
  const userInitials = userName.split(' ').map(n => n[0]).join('');
  const navItems = getNavItemsByRole(session?.user?.role);
  const homeLink = session?.user?.role === 'teacher' ? '/teacher/dashboard' : session?.user?.role === 'representative' ? '/representative/dashboard' : '/dashboard';


  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:py-4">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
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
              return (
                 <Link key={item.href} href={item.href!} className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
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
      
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar..."
          className="w-full rounded-lg bg-card pl-8 md:w-[200px] lg:w-[320px]"
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
            <Avatar>
              <AvatarImage src="" alt={userName} />
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
    </header>
  );
}
