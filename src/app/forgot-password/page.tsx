import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <ForgotPasswordForm />
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="/loggin.webp"
          alt="Imagen de niños felices aprendiendo en un ambiente de apoyo"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
