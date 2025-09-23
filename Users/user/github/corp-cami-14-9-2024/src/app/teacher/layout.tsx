// This file is no longer needed to render the layout structure,
// as it is now handled by the main AppLayout based on user role.
// We keep it to potentially add teacher-specific context providers in the future.

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
