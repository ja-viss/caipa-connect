import { RegisterForm } from '@/components/auth/register-form';
import Image from 'next/image';

export default function RegisterPage() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://picsum.photos/seed/children-register/1200/800"
          alt="Imagen de niños felices colaborando"
          width="1920"
          height="1080"
          data-ai-hint="happy children"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
      <div className="flex items-center justify-center py-12">
        <RegisterForm />
      </div>
    </div>
  );
}
