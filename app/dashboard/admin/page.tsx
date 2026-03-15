"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/Card";
import { Package, FolderOpen, Users } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    productCount: 0,
    categoryCount: 0,
    adminCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Fetch stats from API
        const [productsRes, categoriesRes] = await Promise.all([
          fetch("/api/productos"),
          fetch("/api/categorias"),
        ]);

        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();

        setStats({
          productCount: productsData.productos?.length || 0,
          categoryCount: categoriesData.categorias?.length || 0,
          adminCount: 1,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    link,
  }: {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    link: string;
  }) => (
    <Link href={link}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardContent className="pt-6 flex items-start justify-between">
          <div>
            <p className="text-gray-600 text-sm">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          </div>
          <div className="text-primary">{Icon}</div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido al Dashboard</h1>
        <p className="text-gray-600">Aquí puedes gestionar todos los productos y categorías</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Productos"
          value={stats.productCount}
          icon={<Package size={32} />}
          link="/dashboard/admin/productos"
        />
        <StatCard
          title="Categorías"
          value={stats.categoryCount}
          icon={<FolderOpen size={32} />}
          link="/dashboard/admin/categorias"
        />
        <StatCard
          title="Administradores"
          value={stats.adminCount}
          icon={<Users size={32} />}
          link="/dashboard/admin/lista-productos"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/dashboard/admin/productos/crear"
              className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors text-center font-medium border border-black"
            >
              Crear Nuevo Producto
            </Link>
            <Link
              href="/dashboard/admin/categorias"
              className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors text-center font-medium border border-black"
            >
              Gestionar Categorías
            </Link>
            <Link
              href="/dashboard/admin/lista-productos"
              className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors text-center font-medium border border-black"
            >
              Ver Lista de Productos
            </Link>
            <Link
              href="/muebles-venta"
              className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors text-center font-medium border border-black"
            >
              Ver Sitio Público
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <p>✓ Sistema operativo correctamente</p>
            <p>✓ Base de datos conectada</p>
            <p>✓ Autenticación habilitada</p>
            <p>✓ Carga de imágenes disponible</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
