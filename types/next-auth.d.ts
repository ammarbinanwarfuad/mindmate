import { DefaultSession, DefaultUser, JWT } from "next-auth";

declare module "next-auth" {
  // Extend the Session type
  interface Session {
    user: {
      // These custom properties are REQUIRED in your session object
      id: string;
       email: string | null | undefined; // Align with reality/token
      name: string | null | undefined;  // Align with reality/token
    } & DefaultSession["user"];
  }

  // Extend the User type returned by the database/authorize
  interface User extends DefaultUser {
    // These custom properties are REQUIRED when a User object is returned
    id: string;
    email: string;
    name: string;
  }
}

declare module "next-auth/jwt" {
  // Extend the JWT type
  interface JWT {
    // These custom properties are REQUIRED in the JWT token
    id: string;
    email: string | null;
    name: string | null;
  }
}
