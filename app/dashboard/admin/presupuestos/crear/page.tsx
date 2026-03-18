"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PresupuestoForm } from "@/components/dashboard/PresupuestoForm";
import { PresupuestoCreateInput } from "@/lib/validation-presupuesto";
import { Alert } from "@/components/common/Alert";

export default function Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: PresupuestoCreateInput) => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem("accessToken");

    try {
      const response = await fetch("/api/presupuestos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token || ""}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error creando cotización");
      }

      const presupuesto = await response.json();
      router.push(`/dashboard/admin/presupuestos/${presupuesto.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Crear Cotización</h1>
      
      {error && <Alert type="error" message={error} />}

      <PresupuestoForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        titulo="Nueva Cotización"
      />
    </div>
  );
}
