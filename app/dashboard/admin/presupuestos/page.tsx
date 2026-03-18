"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Alert } from "@/components/common/Alert";
import { Eye, Edit2, Delete, Download, Plus } from "lucide-react";

interface Presupuesto {
  id: string;
  numero: string;
  clienteNombre: string | null;
  estado: string;
  subtotal: string;
  total: string;
  fechaCreacion: string;
}

export default function Page() {
  const router = useRouter();
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");

  const cargarPresupuestos = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      
      const params = new URLSearchParams();
      if (filtroEstado) params.append("estado", filtroEstado);
      if (filtroCliente) params.append("clienteNombre", filtroCliente);

      const response = await fetch(
        `/api/presupuestos?${params.toString()}`,
        {
          headers: {
            "Authorization": `Bearer ${token || ""}`,
          },
        }
      );
      if (!response.ok) throw new Error("Error cargando presupuestos");

      const data = await response.json();
      setPresupuestos(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(cargarPresupuestos, 300);
    return () => clearTimeout(timer);
  }, [filtroEstado, filtroCliente]);

  const handleEliminar = async (id: string) => {
    if (!confirm("¿Eliminar esta cotización?")) return;
    const token = localStorage.getItem("accessToken");

    try {
      const response = await fetch(`/api/presupuestos/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token || ""}`,
        },
      });
      if (!response.ok) throw new Error("Error eliminando");
      await cargarPresupuestos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const handleDescargarPDF = async (id: string, numero: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No hay token de acceso");
      
      // Abrimos la URL en una nueva pestaña/ventana, pasando el token por URL
      // El navegador se encargará nativamente de descargar el archivo y respetar .pdf
      const url = `/api/presupuestos/${id}/export-pdf?token=${token}`;
      window.open(url, '_blank');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error iniciando descarga de PDF");
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "borrador":
        return "bg-yellow-100 text-yellow-800";
      case "enviado":
        return "bg-blue-100 text-blue-800";
      case "aceptado":
        return "bg-green-100 text-green-800";
      case "rechazado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Cotizaciones</h1>
        <Button 
          onClick={() => router.push("/dashboard/admin/presupuestos/crear")}
          className="flex items-center gap-2 !bg-white !text-black border border-black hover:!bg-black hover:!text-white hover:border-white">
            <Plus size={20} />
            Nueva Cotización

        </Button>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* FILTROS */}
      <Card>
        <Card.Content className="grid grid-cols-2 gap-4 py-4">
          <Input
            placeholder="Buscar por cliente..."
            value={filtroCliente}
            onChange={(e) => setFiltroCliente(e.target.value)}
          />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Todos los estados</option>
            <option value="borrador">Borrador</option>
            <option value="enviado">Enviado</option>
            <option value="aceptado">Aceptado</option>
            <option value="rechazado">Rechazado</option>
          </select>
        </Card.Content>
      </Card>

      {/* TABLA */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Número
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Fecha
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Cargando...
                  </td>
                </tr>
              ) : presupuestos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No hay cotizaciones
                  </td>
                </tr>
              ) : (
                presupuestos.map((pres) => (
                  <tr key={pres.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold">{pres.numero}</td>
                    <td className="px-6 py-4">{pres.clienteNombre || "-"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(
                          pres.estado
                        )}`}
                      >
                        {pres.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">
                      S/ {parseFloat(pres.total).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(pres.fechaCreacion).toLocaleDateString(
                        "es-PE"
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            handleDescargarPDF(pres.id, pres.numero)
                          }
                          title="Descargar PDF"
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                        >
                          <Download size={18} />
                        </button>
                        <Link
                          href={`/dashboard/admin/presupuestos/${pres.id}`}
                          title="Editar"
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <button
                          onClick={() => handleEliminar(pres.id)}
                          title="Eliminar"
                          className="p-2 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Delete size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
