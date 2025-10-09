import LoginForm from '@/components/auth/LoginForm';
import { auth } from "@/auth"; // Correct import from the root auth.ts
// import { authOptions } from '@/app/api/auth/[...nextauth]/route'; <-- REMOVED: This is no longer exported or needed.
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  // auth() is the correct way to get the session on the server in NextAuth v5
  const session = await auth(); 
  
  if (session) {
    redirect('/dashboard');
  }

  return <LoginForm />;
}
