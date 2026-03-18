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
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  Home,
  ShoppingBag,
  List,
  Newspaper,
} from "lucide-react";
import { useState } from "react";

export const DashboardSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Detect which collapsible sections should start open
  const isVentaRoute =
    pathname === "/dashboard/admin/lista-productos" ||
    pathname.startsWith("/dashboard/admin/productos") ||
    pathname === "/dashboard/admin/categorias" ||
    pathname.startsWith("/dashboard/admin/categorias/");

  const isEmpotradosRoute = pathname.startsWith(
    "/dashboard/admin/muebles-empotrados"
  );

  const [ventaOpen, setVentaOpen] = useState(isVentaRoute);
  const [mueblesOpen, setMueblesOpen] = useState(isEmpotradosRoute);

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
      label: "Categorías de Colores",
      path: "/dashboard/admin/categorias-colores",
      icon: FolderOpen,
    },
    {
      label: "Colores",
      path: "/dashboard/admin/colores",
      icon: Package,
    },
    {
      label: "Publicaciones",
      path: "/dashboard/admin/publicaciones",
      icon: Newspaper,
    },
    {
      label: "Cotizaciones",
      path: "/dashboard/admin/presupuestos",
      icon: FileText,
    },
    {
      label: "Configuración",
      path: "/dashboard/admin/configuracion",
      icon: Settings,
    },
  ];

  const ventaSubItems = [
    {
      label: "Categorías",
      path: "/dashboard/admin/categorias",
      icon: FolderOpen,
    },
    {
      label: "Productos",
      path: "/dashboard/admin/lista-productos",
      icon: Package,
    },
  ];

  const empotradosSubItems = [
    {
      label: "Categorías",
      path: "/dashboard/admin/muebles-empotrados/categorias",
      icon: FolderOpen,
    },
    {
      label: "Productos",
      path: "/dashboard/admin/muebles-empotrados/productos",
      icon: Package,
    },
  ];

  // Helper to render a collapsible section
  const renderCollapsible = (
    label: string,
    icon: React.ElementType,
    isOpenState: boolean,
    toggle: () => void,
    isActiveSection: boolean,
    subItems: { label: string; path: string; icon: React.ElementType }[]
  ) => {
    const Icon = icon;
    return (
      <div>
        <button
          onClick={toggle}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full text-left ${
            isActiveSection
              ? "bg-primary/20 text-white"
              : "text-gray-300 hover:bg-gray-800"
          }`}
        >
          <Icon size={20} />
          <span className="flex-1">{label}</span>
          {isOpenState ? (
            <ChevronDown size={16} />
          ) : (
            <ChevronRight size={16} />
          )}
        </button>

        {isOpenState && (
          <div className="ml-4 mt-1 space-y-1">
            {subItems.map((item) => {
              const SubIcon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
                    isActive(item.path)
                      ? "bg-primary text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                  }`}
                >
                  <SubIcon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

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

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto max-h-[calc(100vh-160px)]">
          {/* Dashboard link (first item, always visible) */}
          <Link
            href="/dashboard/admin"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive("/dashboard/admin")
                ? "bg-primary text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>

          {/* Muebles en Venta - Collapsible */}
          {renderCollapsible(
            "Muebles en Venta",
            ShoppingBag,
            ventaOpen,
            () => setVentaOpen(!ventaOpen),
            isVentaRoute,
            ventaSubItems
          )}

          {/* Muebles Empotrados - Collapsible */}
          {renderCollapsible(
            "Muebles Empotrados",
            Home,
            mueblesOpen,
            () => setMueblesOpen(!mueblesOpen),
            isEmpotradosRoute,
            empotradosSubItems
          )}

          {/* Remaining standalone items */}
          {menuItems.slice(1).map((item) => {
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
