"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaFacebook, FaApple } from "react-icons/fa";
import { SiAuth0 } from "react-icons/si";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { LoginSkeleton } from "@/app/SkeletonLoading";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/chat";
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    username: "",
    password: "",
  });
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("/api/users/login", user);
      if (response.status === 200) {
        // Assuming the response contains user data or a success message
        toast.success("Login successful!");
        router.push("/chat");
      }
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
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
                  htmlFor="username"
                >
                  Username
                </label>
                <input
                  className="p-3 border-2 border-blue-400 rounded-lg focus:outline-none focus:border-blue-600 transition bg-blue-50 text-black"
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Enter your username"
                  value={user.username}
                  onChange={(e) =>
                    setUser({ ...user, username: e.target.value })
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
              >
                Login
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
              onClick={() => signIn("google", { callbackUrl })}
              className="group relative w-full flex justify-center items-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 gap-2"
            >
              <FcGoogle className="w-5 h-5" />
              Sign in with Google
            </button>
          </div>
          <div>
            <button
              onClick={() => signIn("github", { callbackUrl })}
              className="group relative w-full flex justify-center items-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 gap-2"
            >
              <FaGithub className="w-5 h-5" />
              Sign in with GitHub
            </button>
          </div>
          <div>
            <button
              onClick={() => signIn("facebook", { callbackUrl })}
              className="group relative w-full flex justify-center items-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 gap-2"
            >
              <FaFacebook className="w-5 h-5 text-blue-600" />
              Sign in with Facebook
            </button>
          </div>
          <div>
            <button
              onClick={() => signIn("auth0", { callbackUrl })}
              className="group relative w-full flex justify-center items-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 gap-2"
            >
              <SiAuth0 className="w-5 h-5 text-orange-600" />
              Sign in with Auth0
            </button>
          </div>
          <div>
            <button
              onClick={() => signIn("apple", { callbackUrl })}
              className="group relative w-full flex justify-center items-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 gap-2"
            >
              <FaApple className="w-5 h-5 text-black" />
              Sign in with Apple
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
