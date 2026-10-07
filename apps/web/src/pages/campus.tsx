import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_NAME, CampusGraphResponse, CampusEntityType } from "@ezykwelez/shared";

export default function CampusInspectionPage() {
  const [graphData, setGraphData] = useState<CampusGraphResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  useEffect(() => {
    // In Phase 3, provide standard seeded inspection visualization
    const mockCampusId = "a0000000-0000-0000-0000-000000000001";
    fetch(`http://localhost:8000/api/campuses/${mockCampusId}/graph`, {
      headers: {
        Authorization: "Bearer test-mock-token",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: CampusGraphResponse) => {
        setGraphData(data);
        setLoading(false);
      })
      .catch((err) => {
        // Fallback local baseline visualization if backend dev server is not actively running
        setGraphData({
          campusId: mockCampusId,
          nodes: [
            { id: "b1", entityType: CampusEntityType.LOCATION, name: "Main Library", code: "LOC-LIB", typeCategory: "library", status: "active" as any, locationId: null },
            { id: "b2", entityType: CampusEntityType.LOCATION, name: "Central Canteen", code: "LOC-CAN", typeCategory: "canteen", status: "active" as any, locationId: null },
            { id: "c1", entityType: CampusEntityType.RESOURCE, name: "Main Transformer", code: "RES-TX-01", typeCategory: "power", status: "active" as any, locationId: null },
            { id: "c2", entityType: CampusEntityType.RESOURCE, name: "Network Core Switch", code: "RES-NET-CORE", typeCategory: "network", status: "active" as any, locationId: null },
            { id: "d1", entityType: CampusEntityType.SERVICE, name: "Library Wi-Fi", code: "SVC-WIFI-LIB", typeCategory: "network", status: "active" as any, locationId: "b1" },
          ],
          edges: [
            { id: "e1", sourceType: CampusEntityType.RESOURCE, sourceId: "c1", targetType: CampusEntityType.LOCATION, targetId: "b1", dependencyType: "power" as any, strength: "critical" as any, description: "Power to Library" },
            { id: "e2", sourceType: CampusEntityType.RESOURCE, sourceId: "c2", targetType: CampusEntityType.SERVICE, targetId: "d1", dependencyType: "network" as any, strength: "required" as any, description: "Internet to Wi-Fi" },
          ],
          summary: {
            totalLocations: 9,
            totalResources: 8,
            totalServices: 7,
            totalDependencies: 15,
          },
        });
        setLoading(false);
      });
  }, []);

  return (
    <ProtectedRoute>
      <Head>
        <title>Campus Topology — {APP_NAME}</title>
      </Head>

      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        {/* Navigation */}
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/app" className="text-lg font-bold text-white tracking-tight">
              {APP_NAME}
            </Link>
            <Badge variant="outline" className="text-xs text-blue-400 border-blue-800">
              Phase 3: Campus Dependency Graph
            </Badge>
          </div>
          <Link
            href="/app"
            className="text-xs text-slate-400 hover:text-slate-200 transition"
          >
            &larr; Back to App
          </Link>
        </header>

        {/* Content */}
        <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Campus Model & Dependency Topology</h1>
            <p className="text-sm text-slate-400">
              Structural representation of Ezy University locations, infrastructure resources, services, and multi-tier dependency edges.
            </p>
          </div>

          {/* Graph Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-xs text-slate-400 font-medium">Locations</div>
                <div className="text-2xl font-bold text-white mt-1">
                  {graphData?.summary.totalLocations ?? 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-xs text-slate-400 font-medium">Resources</div>
                <div className="text-2xl font-bold text-blue-400 mt-1">
                  {graphData?.summary.totalResources ?? 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-xs text-slate-400 font-medium">Services</div>
                <div className="text-2xl font-bold text-emerald-400 mt-1">
                  {graphData?.summary.totalServices ?? 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-xs text-slate-400 font-medium">Dependency Edges</div>
                <div className="text-2xl font-bold text-purple-400 mt-1">
                  {graphData?.summary.totalDependencies ?? 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Entity & Topology Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Topology Nodes ({graphData?.nodes.length ?? 0})</CardTitle>
                <CardDescription>Campus physical locations, infrastructure, and services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {graphData?.nodes.map((node) => (
                  <div
                    key={node.id}
                    onClick={() => setSelectedEntity(node.name)}
                    className={`flex items-center justify-between p-3 rounded-lg border transition cursor-pointer ${
                      selectedEntity === node.name
                        ? "bg-blue-950/40 border-blue-700 text-white"
                        : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-sm text-white">{node.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{node.code}</div>
                    </div>
                    <Badge
                      variant={
                        node.entityType === CampusEntityType.LOCATION
                          ? "default"
                          : node.entityType === CampusEntityType.RESOURCE
                          ? "warning"
                          : "success"
                      }
                      className="capitalize text-[10px]"
                    >
                      {node.entityType} ({node.typeCategory})
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dependency Edges</CardTitle>
                <CardDescription>Source &rarr; Target directed relationships</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto pr-2 text-xs">
                {graphData?.edges.map((edge) => (
                  <div key={edge.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-slate-300 font-medium">{edge.description || "Dependency Edge"}</div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="capitalize">{edge.dependencyType}</span>
                      <span className="capitalize font-mono text-blue-400">[{edge.strength}]</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
