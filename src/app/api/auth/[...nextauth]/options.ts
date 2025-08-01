import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import Auth0Provider from "next-auth/providers/auth0";
import AppleProvider from "next-auth/providers/apple";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await connect();
        const { email, password } = credentials as {
          email: string;
          password: string;
        };
        try {
            const user = await User.findOne({ email });
            if (!user) {
            throw new Error("User not found");
            }
            if (!user.isVerified) {
            throw new Error("Please verify your email before logging in");
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
            throw new Error("Invalid credentials");
            }

            return { id: user._id, username: user.username };
        } catch (error) {
          console.error("Error in credentials provider:", error);
          throw new Error("Authorization failed");
            
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          redirect_uri: process.env.NEXTAUTH_URL + "/api/auth/callback/google",
        },
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
  ],
  pages: {
    signIn: '/sign-in'
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isVerified = user.isVerified; // Assuming you have this field in your user model
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
