"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { SignupSkeleton } from "@/app/SkeletonLoading";
export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUsername] = useState({
    username: "",
    email: "",
    password: "",
  });
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("/api/users/signup", user);
      toast.success("Signup successful!");
      router.push("/login");
      console.log("Signup successful:", response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(`Signup failed. ${error?.response?.data?.message}`);
      } else {
        toast.error("Signup failed. Please try again.");
      }
      console.error("Signup failed:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">
      <Toaster position="bottom-right" />
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">
          Sign Up
        </h1>
        {loading ? (
          <SignupSkeleton />
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
                onChange={(e) => {
                  setUsername({ ...user, username: e.target.value });
                }}
                required
              />
            </div>

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
                onChange={(e) => {
                  setUsername({ ...user, email: e.target.value });
                }}
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
                onChange={(e) => {
                  setUsername({ ...user, password: e.target.value });
                }}
                required
              />
            </div>

            <button
              type="submit"
              className="mt-4 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Sign Up
            </button>
          </form>
        )}
        <p className="mt-4 text-center text-gray-500 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
