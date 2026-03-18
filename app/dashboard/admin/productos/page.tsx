"use client";

import Link from "next/link";
import { Button } from "@/components/common/Button";
import { Plus } from "lucide-react";

export default function ProductosPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestionar Productos</h1>
        <Link href="/dashboard/admin/productos/crear">
          	<Button className="flex items-center gap-2 !bg-white !text-black border border-black hover:!bg-black hover:!text-white hover:border-white">
              <Plus size={20} />      
              Nuevo Producto
          </Button>
        </Link>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <h3 className="font-bold text-lg mb-2">Gestión de Productos</h3>
        <p className="text-gray-700 mb-4">
          Crea, edita y elimina productos desde aquí. Para ver fácilmente todos los productos organizados en una tabla, ve a la sección de "Lista de Productos".
        </p>
        <Link href="/dashboard/admin/lista-productos">
          <Button variant="secondary">Ver Lista Completa de Productos</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/admin/productos/crear">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <Plus size={32} className="text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Crear Producto</h3>
            <p className="text-gray-600">
              Agrega un nuevo producto a tu catálogo con imágenes, descripción y especificaciones.
            </p>
          </div>
        </Link>

        <Link href="/dashboard/admin/lista-productos">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-bold mb-2">Lista de Productos</h3>
            <p className="text-gray-600">
              Ve todos tus productos en una tabla, edita, elimina y filtra por categoría.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
