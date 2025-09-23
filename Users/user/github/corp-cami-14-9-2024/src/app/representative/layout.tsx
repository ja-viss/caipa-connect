// This file is no longer needed to render the layout structure,
// as it is now handled by the main AppLayout based on user role.
// We keep it to potentially add representative-specific context providers in the future.

export default function RepresentativeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
