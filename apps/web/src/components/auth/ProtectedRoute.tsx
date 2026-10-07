import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/auth/AuthContext";
import { Badge } from "@/components/ui/badge";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace({
        pathname: "/login",
        query: { returnUrl: router.asPath },
      });
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Verifying authentication session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-6 text-center space-y-4">
          <Badge variant="warning">Access Restricted</Badge>
          <h2 className="text-xl font-bold text-white">Insufficient Role Permissions</h2>
          <p className="text-sm text-slate-400">
            Your current role (<span className="text-white font-medium">{profile.role}</span>) does not have access to this resource.
          </p>
          <button
            onClick={() => router.push("/app")}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
