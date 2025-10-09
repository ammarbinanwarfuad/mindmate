import { handlers } from "@/auth";

// The handlers from the root auth.ts file manage GET and POST requests
// for all authentication flows (login, signout, Google callback, etc.)
export const { GET, POST } = handlers;
