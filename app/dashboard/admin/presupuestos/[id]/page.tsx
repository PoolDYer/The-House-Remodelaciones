"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { PresupuestoForm } from "@/components/dashboard/PresupuestoForm";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Alert } from "@/components/common/Alert";
import { PresupuestoCreateInput } from "@/lib/validation-presupuesto";
import { Download, ArrowLeft } from "lucide-react";

interface PresupuestoDetail {
  id: string;
  numero: string;
  estado: string;
  clienteNombre: string | null;
  clienteRuc: string | null;
  clienteDireccion: string | null;
  clienteTelefono: string | null;
  clienteEmail: string | null;
  fechaValidez: string | null;
  subtotal: string;
  igvPorcentaje: string;
  igvMonto: string;
  descuentoTotal: string;
  total: string;
  notas: string | null;
  lineas: Array<{
    id: string;
    numero: number;
    descripcion: string;
    cantidad: string;
    precioUnitario: string;
    descuento: string;
    subtotal: string;
  }>;
}

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [presupuesto, setPresupuesto] = useState<PresupuestoDetail | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`/api/presupuestos/${id}`, {
          headers: {
            "Authorization": `Bearer ${token || ""}`,
          },
        });
        if (!response.ok) throw new Error("Cotización no encontrada");
        const data = await response.json();
        setPresupuesto(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setIsLoading(false);
      }
    };

    cargar();
  }, [id]);

  const handleSubmit = async (data: PresupuestoCreateInput) => {
    setIsSaving(true);
    setError(null);
    const token = localStorage.getItem("accessToken");

    try {
      const response = await fetch(`/api/presupuestos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token || ""}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error actualizando cotización");
      }

      const actualizado = await response.json();
      setPresupuesto(actualizado);
      alert("Cotización actualizada correctamente");
      setIsSaving(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setIsSaving(false);
    }
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDescargarPDF = async () => {
    if (isDownloading) return; // Prevenir descargas duplicadas
    
    setIsDownloading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No hay token de acceso");
      
      const url = `/api/presupuestos/${id}/export-pdf?token=${token}`;
      window.open(url, '_blank');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error iniciando descarga de PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Cargando cotización...</h1>
      </div>
    );
  }

  if (!presupuesto) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Cotización no encontrada</h1>
        <Button onClick={() => router.back()}>
          <ArrowLeft size={18} /> Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Cotización {presupuesto.numero}</h1>
          <div className="mt-2 space-y-1">
            <Badge estado={presupuesto.estado} />
            <p className="text-sm text-gray-600">
              Cliente: {presupuesto.clienteNombre || "Por definir"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleDescargarPDF}
            className="!bg-white !text-black border border-black hover:!bg-black hover:!text-white hover:border-white"
            disabled={isSaving}
            loading={isSaving}
          >
            <Download size={18} /> Descargar PDF
          </Button>
          <Button 
            onClick={() => router.back()}
            className="!bg-white !text-black border border-black hover:!bg-black hover:!text-white hover:border-white"
            disabled={isSaving}
            loading={isSaving}
          >
            <ArrowLeft size={18} /> Volver
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      <PresupuestoForm
        initialData={presupuesto}
        onSubmit={handleSubmit}
        isLoading={isSaving}
        titulo={`Editar Cotización ${presupuesto.numero}`}
      />
    </div>
  );
}

function Badge({ estado }: { estado: string }) {
  const getColor = (estado: string) => {
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
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getColor(estado)}`}>
      {estado}
    </span>
  );
}
