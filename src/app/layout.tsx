import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Sidebar } from '@/components/layout/sidebar';
import Header from '@/components/layout/header';

export const metadata: Metadata = {
  title: 'CAIPA Connect',
  description: 'A platform for educators and representatives to connect and support student progress.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased', 'min-h-screen w-full bg-background text-foreground flex')}>
        <Sidebar />
        <div className="flex flex-col w-full">
          <Header />
          <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-auto">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
