"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  const [user, setUser] = React.useState({
    username: "",
    password: "",
  });
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/users/login", user);
      toast.success("Login successful!");
      // Optionally redirect after login
      // router.push("/dashboard");
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">
      <Toaster position="top-center" />
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">
          Login
        </h1>
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label
              className="text-base font-semibold text-blue-800 bg-blue-100 px-2 py-1 rounded mb-1"
              htmlFor="username"
            >
              Username
            </label>
            <input
              className="p-3 border-2 border-blue-400 rounded-lg focus:outline-none focus:border-blue-600 transition bg-blue-50"
              type="text"
              id="username"
              name="username"
              placeholder="Enter your username"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
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
              className="p-3 border-2 border-blue-400 rounded-lg focus:outline-none focus:border-blue-600 transition bg-blue-50"
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
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
        <p className="mt-4 text-center text-gray-500 text-sm">
          Don&#39;t have an account?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}