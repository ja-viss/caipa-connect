import Header from "@/components/layout/header";
import { TeacherSidebar } from "@/components/layout/teacher-sidebar";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full">
      <TeacherSidebar />
      <div className="flex flex-col w-full md:ml-64">
        <Header />
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-auto">
            {children}
        </main>
      </div>
    </div>
  );
}
