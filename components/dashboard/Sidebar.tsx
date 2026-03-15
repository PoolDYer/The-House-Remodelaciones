"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

export const DashboardSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const isActive = (path: string) => pathname === path;

  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Productos",
      path: "/dashboard/admin/productos",
      icon: Package,
    },
    {
      label: "Lista de Productos",
      path: "/dashboard/admin/lista-productos",
      icon: FolderOpen,
    },
    {
      label: "Categorías",
      path: "/dashboard/admin/categorias",
      icon: FolderOpen,
    },
    {
      label: "Categorías de Colores",
      path: "/dashboard/admin/categorias-colores",
      icon: FolderOpen,
    },
    {
      label: "Colores",
      path: "/dashboard/admin/colores",
      icon: Package,
    },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 bg-primary text-white p-2 rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? "bg-primary text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-800 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-300 hover:bg-red-900 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
