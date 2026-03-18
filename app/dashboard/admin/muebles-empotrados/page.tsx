"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/Card";
import { FolderOpen, Package, Plus } from "lucide-react";
import { useEffect, useState } from "react";

export default function MueblesEmpotradosHubPage() {
  const [stats, setStats] = useState({ categorias: 0, muebles: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [catRes, mueRes] = await Promise.all([
          fetch("/api/categorias-muebles-empotrados"),
          fetch("/api/muebles-empotrados"),
        ]);
        const catData = await catRes.json();
        const mueData = await mueRes.json();
        setStats({
          categorias: catData.categorias?.length || 0,
          muebles: mueData.muebles?.length || 0,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Muebles Empotrados</h1>
        <p className="text-gray-600">Gestiona las categorías y productos de muebles empotrados</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/admin/muebles-empotrados/categorias">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6 flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm">Categorías</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {loading ? "..." : stats.categorias}
                </p>
              </div>
              <div className="text-primary">
                <FolderOpen size={32} />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/admin/muebles-empotrados/productos">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6 flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm">Muebles</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {loading ? "..." : stats.muebles}
                </p>
              </div>
              <div className="text-primary">
                <Package size={32} />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/dashboard/admin/muebles-empotrados/categorias"
              className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors text-center font-medium border border-black"
            >
              Gestionar Categorías
            </Link>
            <Link
              href="/dashboard/admin/muebles-empotrados/productos/crear"
              className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors text-center font-medium border border-black"
            >
              Crear Nuevo Mueble
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
