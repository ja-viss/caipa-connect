
'use client';

import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { getSession, logoutUser } from '@/lib/actions/users';
import { useEffect, useState } from 'react';
import type { User as UserType } from '@/lib/types';
import { ThemeToggle } from './theme-toggle';

export default function Header() {
  const [session, setSession] = useState<{ user: UserType } | null>(null);

  useEffect(() => {
    getSession().then(setSession);
  }, []);

  const userName = session?.user?.fullName || 'Usuario';
  const userInitials = userName.split(' ').map(n => n[0]).join('');

  return (
    <div className="fixed top-4 right-4 sm:right-6 lg:right-8 z-40">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="overflow-hidden rounded-full h-12 w-12 border-2 shadow-lg">
              <Avatar className="h-full w-full">
                <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{userName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="flex items-center justify-between pr-2">
              <DropdownMenuItem asChild>
                <Link href="/settings">Configuración</Link>
              </DropdownMenuItem>
              <ThemeToggle />
            </div>
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
  );
}
