'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import Header from './header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage) {
    return <>{children}</>;
  }

  // Check if the path is NOT a representative path
  if (!pathname.startsWith('/representative')) {
     return (
        <div className="flex min-h-screen w-full">
            <Sidebar />
            <div className="flex flex-col w-full md:ml-64">
                <Header />
                <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-auto">{children}</main>
            </div>
        </div>
     );
  }
  
  // For representative layout, let the nested layout handle it.
  return <>{children}</>;
}
