import LoginForm from '@/components/auth/LoginForm';
import { getServerSession } from "next-auth";
import { authOptions } from '@/auth';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect('/dashboard');
  }

  return <LoginForm />;
}
