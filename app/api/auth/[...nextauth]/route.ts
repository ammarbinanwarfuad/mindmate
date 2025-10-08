import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db/mongodb';
import UserModel from '@/lib/db/models/User';
import { NextAuthOptions, User } from 'next-auth'; 

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },



      // app/api/auth/[...nextauth]/route.ts

// ... inside CredentialsProvider

      async authorize(credentials): Promise< User | null> {
        // Add explicit non-null checks or type guards here to narrow the type.
        // A direct non-null assertion (!) should also work if you've already
        // checked for existence above.
        
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        try {
          await connectDB();
          
          const user = await UserModel.findOne({ 
            // Fix: Cast credentials.email to string to resolve ts(2339)
            email: (credentials.email as string).toLowerCase() 
          });

          if (!user || !user.passwordHash) {
            throw new Error('Invalid credentials');
          }

          // Fix: Cast credentials.password to string to resolve ts(2769) overloads
          const isValid = await bcrypt.compare(
            credentials.password as string, 
            user.passwordHash
          );

          if (!isValid) {
            throw new Error('Invalid credentials');
          }
// ...







    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
    newUser: '/dashboard',
  },
  callbacks: {
    // Add explicit types for all arguments in the jwt callback
    async jwt({ token, user, trigger, session }: { token: any; user: any; trigger: any; session: any }) { 
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      
      // Handle session updates
      if (trigger === 'update' && session) {
        token.name = session.name;
      }
      
      return token;
    },
    // Add explicit types for all arguments in the session callback
    async session({ session, token }: { session: any; token: any }) { 
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
    // The redirect callback is already correctly typed with destructured arguments.
    async redirect({ url, baseUrl }) { 
      // ... (existing code)
    }
  },
  events: {
    async signIn({ user }) {
      console.log('User signed in:', user.email);
    },
    async signOut({ token }) {
      console.log('User signed out:', token.email);
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };