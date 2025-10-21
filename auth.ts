import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/mongodb"; 
import UserModel from "@/lib/db/models/User"; 

// Custom user type must match what is returned by authorize
interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export const authOptions: NextAuthOptions = {
  // --- PROVIDERS ---
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<AuthUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        await connectDB(); 

        const user = await UserModel.findOne({
          email: String(credentials.email).toLowerCase(),
        });

        if (!user || !user.passwordHash) {
          throw new Error("Invalid credentials");
        }

        const isValid = await bcrypt.compare(
          String(credentials.password),
          user.passwordHash
        );

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.profile.name, 
        };
      },
    }),
  ],

  // --- SESSION & JWT CONFIG ---
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  
  // --- PAGES ---
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
    newUser: "/dashboard",
  },
  
  // --- CALLBACKS ---
  callbacks: {
    async jwt({ token, user, session, trigger }) {
      if (user) {
        // user is available on initial sign in 
        token.id = user.id;
        token.email = user.email ?? null;
        token.name = user.name ?? null;
      }

      if (trigger === "update" && session?.user?.name) {
        token.name = session.user.name;
      }

      return token;
    },

    // This resolves the Type 'string | undefined' error when coupled with the updated types/next-auth.d.ts
    async session({ session, token }) {
      if (session.user && token.id) {
        // Assigning custom properties to the session user object
        (session.user as any).id = token.id;  
      }
      (session.user as any).email = token.email; // FIX 2: Add casting
      (session.user as any).name = token.name;   // FIX 2: Add casting
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl; 
    },
  },

  // --- SECRET & DEBUG ---
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
