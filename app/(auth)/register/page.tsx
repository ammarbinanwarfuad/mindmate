import RegisterForm from '@/components/auth/RegisterForm';
import { auth } from "@/auth";
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function RegisterPage() {
  const session = await auth();
  
  if (session) {
    redirect('/dashboard');
  }

  return <RegisterForm />;
}