"use client";

import { signIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { LoginSkeleton } from "@/app/SkeletonLoading";

// Move all your logic into a new component
function SignInPageContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/chat";
  const error = searchParams.get("error");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session) {
      router.push(callbackUrl);
    }
  }, [session, router, callbackUrl]);

  useEffect(() => {
    if (error) {
      let errorMessage = "Authentication failed";
      switch (error) {
        case "OAuthCallback":
          errorMessage =
            "OAuth authentication failed. Please check your provider settings.";
          break;
        case "Configuration":
          errorMessage =
            "Authentication configuration error. Please contact support.";
          break;
        case "AccessDenied":
          errorMessage = "Access denied. Please try again.";
          break;
        default:
          errorMessage = `Authentication error: ${error}`;
      }
      toast.error(errorMessage);
    }
  }, [error]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Redirecting to chat...</div>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: user.email,
        password: user.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
      } else if (result?.ok) {
        toast.success("Login successful!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error: unknown) {
      toast.error("Login failed. Please try again.");
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: string) => {
    try {
      await signIn(provider, {
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
      toast.error(`${provider} sign in failed. Please try again.`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-center mb-6 text-blue-700">
            Sign in to your account
          </h2>
        </div>
        <Toaster position="top-center" />
        <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
          {loading ? (
            <LoginSkeleton />
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label
                  className="text-base font-semibold text-blue-800 bg-blue-100 px-2 py-1 rounded mb-1"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  className="p-3 border-2 border-blue-400 rounded-lg focus:outline-none focus:border-blue-600 transition bg-blue-50 text-black"
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={user.email}
                  onChange={(e) =>
                    setUser({ ...user, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  className="text-base font-semibold text-blue-800 bg-blue-100 px-2 py-1 rounded mb-1"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  className="p-3 border-2 border-blue-400 rounded-lg focus:outline-none focus:border-blue-600 transition bg-blue-50 text-black"
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={user.password}
                  onChange={(e) =>
                    setUser({ ...user, password: e.target.value })
                  }
                  required
                />
              </div>
              <button
                type="submit"
                className="mt-4 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          )}
          <p className="mt-4 text-center text-gray-500 text-sm">
            Don&#39;t have an account?{" "}
            <Link href="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div>
            <button
              onClick={() => handleOAuthSignIn("google")}
              className="group relative w-full flex justify-center items-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 gap-2"
            >
              <FcGoogle className="w-5 h-5" />
              Sign in with Google
            </button>
          </div>
          <div>
            <button
              onClick={() => handleOAuthSignIn("github")}
              className="group relative w-full flex justify-center items-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 gap-2"
            >
              <FaGithub className="w-5 h-5" />
              Sign in with GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export the Suspense-wrapped component as default
export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignInPageContent />
    </Suspense>
  );
}