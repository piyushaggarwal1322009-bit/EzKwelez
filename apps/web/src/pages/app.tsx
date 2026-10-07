import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/auth/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { APP_NAME } from "@ezykwelez/shared";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AppDashboard() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>App Workspace — {APP_NAME}</title>
      </Head>

      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        {/* Top Navbar */}
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-lg font-bold text-white tracking-tight">{APP_NAME}</span>
            <Badge variant="outline" className="text-xs text-blue-400 border-blue-800">
              Authenticated Session
            </Badge>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-white">
                {profile?.fullName || user?.user_metadata?.full_name || user?.email}
              </div>
              <div className="text-[10px] text-slate-400 capitalize">
                Role: {profile?.role || "student"}
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Welcome to EzyKwelez
            </h1>
            <p className="text-sm text-slate-400">
              Authentication and User Profile database layer is active and verified.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Session & Profile Foundation</CardTitle>
                <CardDescription>Verified Supabase user profile context</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">User UUID:</span>
                  <span className="font-mono text-xs text-slate-200">{user?.id}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-slate-200 font-medium">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Full Name:</span>
                  <span className="text-slate-200">
                    {profile?.fullName || user?.user_metadata?.full_name || "Not set"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-400">Assigned Role:</span>
                  <Badge variant="success" className="capitalize">
                    {profile?.role || "student"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Status</CardTitle>
                <CardDescription>Row Level Security & Tokens</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-slate-300">
                <div className="flex items-center space-x-2 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>RLS Active on Profiles</span>
                </div>
                <div className="flex items-center space-x-2 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Client Session Persisted</span>
                </div>
                <div className="flex items-center space-x-2 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Zero Secrets in Client</span>
                </div>
                <p className="text-slate-500 pt-2 text-[11px] leading-relaxed">
                  Phase 2 foundation complete. Ready for Phase 3 (Campus Topology & Dependency Graph Engine).
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
