import * as React from "react";
import Head from "next/head";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { APP_NAME } from "@ezykwelez/shared";
import { checkApiHealth } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthContext";

export default function HomePage() {
  const [healthStatus, setHealthStatus] = React.useState<string>("Checking API...");
  const [isHealthy, setIsHealthy] = React.useState<boolean | null>(null);
  const { user, profile } = useAuth();

  React.useEffect(() => {
    let isMounted = true;
    checkApiHealth()
      .then((data) => {
        if (isMounted) {
          setHealthStatus(`${data.service} (${data.status})`);
          setIsHealthy(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setHealthStatus("API unreachable (Start backend to connect)");
          setIsHealthy(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <Head>
        <title>{APP_NAME} — Campus Decision Engine</title>
        <meta
          name="description"
          content="EzyKwelez campus disruption-response and recovery decision engine."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen bg-slate-950 text-slate-100 p-8 flex flex-col items-center justify-center">
        <div className="max-w-4xl w-full space-y-8">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Badge variant="outline" className="text-blue-400 border-blue-800">
                Phase 2: Auth & Database Foundation
              </Badge>
              <Badge
                variant={isHealthy === true ? "success" : isHealthy === false ? "warning" : "default"}
              >
                {healthStatus}
              </Badge>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              {APP_NAME}
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
              Campus Disruption-Response & Recovery Engine. Supabase Authentication and User Profiles foundation configured.
            </p>

            <div className="pt-4 flex items-center justify-center gap-4">
              {user ? (
                <Link
                  href="/app"
                  className="py-2.5 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition"
                >
                  Enter Workspace ({profile?.fullName || user.email}) &rarr;
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="py-2 px-5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="py-2 px-5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition"
                  >
                    Register Account
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Ownership Boundaries</CardTitle>
                <CardDescription>Role and directory separation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="border-l-2 border-blue-500 pl-3">
                  <span className="font-semibold text-white">Piyush:</span> Backend, Auth & DB (<code className="text-xs text-blue-300">apps/api/</code>, <code className="text-xs text-blue-300">supabase/</code>)
                </div>
                <div className="border-l-2 border-purple-500 pl-3">
                  <span className="font-semibold text-white">Aile:</span> UI/UX Design System (<code className="text-xs text-purple-300">apps/ui-ux/</code>)
                </div>
                <div className="border-l-2 border-emerald-500 pl-3">
                  <span className="font-semibold text-white">Ishu:</span> Frontend Features (<code className="text-xs text-emerald-300">features/ishu/</code>)
                </div>
                <div className="border-l-2 border-amber-500 pl-3">
                  <span className="font-semibold text-white">Tanisha:</span> Frontend Features (<code className="text-xs text-amber-300">features/tanisha/</code>)
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Supabase Architecture</CardTitle>
                <CardDescription>Auth, Profiles and RLS</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-slate-300">
                <div className="p-2 rounded bg-slate-900 border border-slate-800 font-mono">
                  Supabase Auth &rarr; Trigger on_auth_user_created &rarr; public.profiles &rarr; Restrictive RLS
                </div>
                <p className="text-slate-500 pt-2">
                  Session persistence, strict Row-Level Security, and typed client abstractions established.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
