import * as React from "react";
import { useRouter } from "next/router";
import Head from "next/head";

/**
 * Compatibility Route for /live-conditions
 * Deprecated in Phase 2 in favor of canonical /campus
 */
export default function DeprecatedLiveConditionsPage() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace("/campus");
  }, [router]);

  return (
    <>
      <Head>
        <title>Redirecting to Campus Intelligence...</title>
      </Head>
      <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center p-4 font-mono">
        <p className="text-xs">Redirecting to canonical /campus...</p>
      </div>
    </>
  );
}
