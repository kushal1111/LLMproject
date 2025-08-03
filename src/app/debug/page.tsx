"use client";

import { useSession } from "next-auth/react";

export default function DebugPage() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">OAuth Debug Information</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">Session Status</h2>
          <p>Status: {status}</p>
          {session && (
            <div>
              <p>User: {session.user?.email}</p>
              <p>Name: {session.user?.name}</p>
            </div>
          )}
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">Environment Variables Check</h2>
          <p>NEXTAUTH_URL: {process.env.NEXT_PUBLIC_NEXTAUTH_URL || 'Not set'}</p>
          <p>NEXTAUTH_SECRET: {process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set'}</p>
          <p>GOOGLE_CLIENT_ID: {process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set'}</p>
          <p>GITHUB_ID: {process.env.GITHUB_ID ? 'Set' : 'Not set'}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">Next Steps</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Create a .env.local file in your project root</li>
            <li>Add the required environment variables (see env-template.txt)</li>
            <li>Set up OAuth apps in Google Cloud Console and GitHub</li>
            <li>Restart your development server</li>
            <li>Try signing in again</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 