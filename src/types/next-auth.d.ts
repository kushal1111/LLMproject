import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string;
    username?: string;
    email?: string;
    image?: string;
    isVerified?: boolean;
  }

  interface Session {
    user: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username?: string;
    email?: string;
    isVerified?: boolean;
  }
}