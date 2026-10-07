import * as React from "react";
import Head from "next/head";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { APP_NAME } from "@ezykwelez/shared";
import { checkApiHealth } from "@/lib/api/client";

export default function HomePage() {
  const [healthStatus, setHealthStatus] = React.useState<string>("Checking API...");
  const [isHealthy, setIsHealthy] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    checkApiHealth()
      .then((data) => {
        if (isMounted) {
          setHealthStatus(`${data.service} (${data.status})`);
          setIsHealthy(true);
        }
      })
      .catch((err) => {
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
        <title>{APP_NAME} — Foundation</title>
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
                Phase 1: Codebase Foundation
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
              Campus Disruption-Response & Recovery Engine. The repository and architecture foundation is ready for modular domain feature implementation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Ownership Boundaries</CardTitle>
                <CardDescription>Role and directory separation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="border-l-2 border-blue-500 pl-3">
                  <span className="font-semibold text-white">Piyush:</span> Backend & API Integration (<code className="text-xs text-blue-300">apps/api/</code>)
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
                <CardTitle>Architecture Pipeline</CardTitle>
                <CardDescription>Core decision loop pipeline</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-slate-300">
                <div className="p-2 rounded bg-slate-900 border border-slate-800 font-mono">
                  Campus Data &rarr; Dependency Graph &rarr; Incident &rarr; Blast Radius &rarr; Recovery Plans &rarr; Optimization &rarr; Simulation &rarr; AI Explanation
                </div>
                <p className="text-slate-500 pt-2">
                  Engine-first principle enforced: deterministic domain reasoning isolated from presentation and AI adapters.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
