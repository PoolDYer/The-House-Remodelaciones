"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Alert } from "@/components/common/Alert";
import { LineaPresupuestoInput, PresupuestoCreateInput } from "@/lib/validation-presupuesto";
import {
  calcularSubtotalLinea,
  calcularSubtotalPresupuesto,
  calcularIGV,
  calcularTotal,
} from "@/lib/presupuestos";
import { Trash2, Plus } from "lucide-react";

interface LineaFormulario extends Omit<LineaPresupuestoInput, 'numero'> {
  numero: number;
  subtotal: number;
}

interface PresupuestoFormProps {
  initialData?: any;
  onSubmit: (data: PresupuestoCreateInput) => Promise<void>;
  isLoading?: boolean;
  titulo?: string;
}

export function PresupuestoForm({
  initialData,
  onSubmit,
  isLoading = false,
  titulo = "Crear Presupuesto",
}: PresupuestoFormProps) {
  const [clienteNombre, setClienteNombre] = useState(
    initialData?.clienteNombre || ""
  );
  const [clienteRuc, setClienteRuc] = useState(initialData?.clienteRuc || "");
  const [clienteDireccion, setClienteDireccion] = useState(
    initialData?.clienteDireccion || ""
  );
  const [clienteTelefono, setClienteTelefono] = useState(
    initialData?.clienteTelefono || ""
  );
  const [clienteEmail, setClienteEmail] = useState(
    initialData?.clienteEmail || ""
  );
  const [fechaValidez, setFechaValidez] = useState(
    initialData?.fechaValidez || ""
  );
  const [igvPorcentaje, setIgvPorcentaje] = useState(
    initialData?.igvPorcentaje || 18
  );
  const [descuentoTotal, setDescuentoTotal] = useState(
    initialData?.descuentoTotal || 0
  );
  const [notas, setNotas] = useState(initialData?.notas || "");
  const [lineas, setLineas] = useState<LineaFormulario[]>(() => {
    if (!initialData?.lineas) {
      return [
        {
          numero: 1,
          descripcion: "",
          cantidad: 1,
          precioUnitario: 0,
          descuento: 0,
          subtotal: 0,
        },
      ];
    }
    // Convertir valores de string/Decimal a números
    return initialData.lineas.map((linea: any) => ({
      numero: linea.numero,
      descripcion: linea.descripcion,
      cantidad: parseFloat(linea.cantidad) || 0,
      precioUnitario: parseFloat(linea.precioUnitario) || 0,
      descuento: parseFloat(linea.descuento) || 0,
      subtotal: parseFloat(linea.subtotal) || 0,
    }));
  });
  const [error, setError] = useState<string | null>(null);

  // Calcular totales
  const subtotalTotal = calcularSubtotalPresupuesto(lineas);
  const igvMonto = calcularIGV(subtotalTotal, igvPorcentaje);
  const totalFinal = calcularTotal(subtotalTotal, igvMonto, descuentoTotal);

  const handleActualizarLinea = useCallback(
    (idx: number, campo: string, valor: any) => {
      setLineas((prev) => {
        const nuevas = [...prev];
        (nuevas[idx] as any)[campo] = valor;

        // Recalcular subtotal
        if (
          campo === "cantidad" ||
          campo === "precioUnitario" ||
          campo === "descuento"
        ) {
          nuevas[idx].subtotal = calcularSubtotalLinea(
            nuevas[idx].cantidad,
            nuevas[idx].precioUnitario,
            nuevas[idx].descuento
          ) as any;
        }

        return nuevas;
      });
    },
    []
  );

  const handleEliminarLinea = (idx: number) => {
    if (lineas.length === 1) {
      setError("Debe tener al menos una línea");
      return;
    }
    setLineas((prev) => prev.filter((_, i) => i !== idx));
    setError(null);
  };

  const handleAgregarLinea = () => {
    const nuevoNumero = Math.max(...lineas.map((l) => l.numero), 0) + 1;
    setLineas((prev) => [
      ...prev,
      {
        numero: nuevoNumero,
        descripcion: "",
        cantidad: 1,
        precioUnitario: 0,
        descuento: 0,
        subtotal: 0,
      },
    ]);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!clienteNombre) {
      setError("Nombre del cliente requerido");
      return;
    }

    if (lineas.length === 0) {
      setError("Debe tener al menos una línea");
      return;
    }

    try {
      await onSubmit({
        clienteNombre,
        clienteRuc: clienteRuc || undefined,
        clienteDireccion: clienteDireccion || undefined,
        clienteTelefono: clienteTelefono || undefined,
        clienteEmail: clienteEmail || undefined,
        fechaValidez: fechaValidez || undefined,
        igvPorcentaje,
        descuentoTotal,
        notas: notas || undefined,
        lineas: lineas.map(({ subtotal, ...rest }) => rest),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    }
  };

  return (
    <Card className="w-full">
      <Card.Header>
        <Card.Title>{titulo}</Card.Title>
      </Card.Header>
      <Card.Content className="space-y-6">
        {error && <Alert type="error" message={error} />}

        {/* DATOS CLIENTE */}
        <div className="border-b pb-4">
          <h3 className="font-semibold mb-4">Datos del Cliente</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nombre del Cliente"
              value={clienteNombre}
              onChange={(e) => setClienteNombre(e.target.value)}
              required
            />
            <Input
              label="RUC"
              value={clienteRuc}
              onChange={(e) => setClienteRuc(e.target.value)}
            />
            <Input
              label="Dirección"
              value={clienteDireccion}
              onChange={(e) => setClienteDireccion(e.target.value)}
            />
            <Input
              label="Teléfono"
              value={clienteTelefono}
              onChange={(e) => setClienteTelefono(e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              value={clienteEmail}
              onChange={(e) => setClienteEmail(e.target.value)}
            />
            <Input
              label="Fecha de Validez"
              type="date"
              value={fechaValidez}
              onChange={(e) => setFechaValidez(e.target.value)}
            />
          </div>
        </div>

        {/* TABLA DE LÍNEAS */}
        <div className="border-b pb-4">
          <h3 className="font-semibold mb-4">Productos/Servicios</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">
                    Descripción
                  </th>
                  <th className="border border-gray-300 p-2 w-20">Cantidad</th>
                  <th className="border border-gray-300 p-2 w-24">P. Unit.</th>
                  <th className="border border-gray-300 p-2 w-24">Descuento</th>
                  <th className="border border-gray-300 p-2 w-28">Subtotal</th>
                  <th className="border border-gray-300 p-2 w-10">Acción</th>
                </tr>
              </thead>
              <tbody>
                {lineas.map((linea, idx) => (
                  <tr key={idx}>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="text"
                        value={linea.descripcion}
                        onChange={(e) =>
                          handleActualizarLinea(
                            idx,
                            "descripcion",
                            e.target.value
                          )
                        }
                        placeholder="Descripción"
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="number"
                        step="0.01"
                        value={linea.cantidad}
                        onChange={(e) =>
                          handleActualizarLinea(
                            idx,
                            "cantidad",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-2 py-1 border rounded text-right"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="number"
                        step="0.01"
                        value={linea.precioUnitario}
                        onChange={(e) =>
                          handleActualizarLinea(
                            idx,
                            "precioUnitario",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-2 py-1 border rounded text-right"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="number"
                        step="0.01"
                        value={linea.descuento}
                        onChange={(e) =>
                          handleActualizarLinea(
                            idx,
                            "descuento",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-2 py-1 border rounded text-right"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 font-semibold text-right">
                      S/ {Number(linea.subtotal).toFixed(2)}
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <button
                        onClick={() => handleEliminarLinea(idx)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button
            onClick={handleAgregarLinea}
            className="mt-4 flex items-center gap-2 !bg-white !text-black border border-black hover:!bg-black hover:!text-white hover:border-white"
            disabled={isLoading}
          >
            <Plus size={18} />
            Agregar Línea
          </Button>
        </div>

        {/* CÁLCULOS */}
        <div className="border-b pb-4">
          <h3 className="font-semibold mb-4">Cálculos</h3>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>S/ {Number(subtotalTotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={igvPorcentaje > 0}
                    onChange={(e) =>
                      setIgvPorcentaje(e.target.checked ? 18 : 0)
                    }
                  />
                  IGV ({igvPorcentaje}%):
                </label>
                <span>S/ {Number(igvMonto).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <label>Descuento Total:</label>
                <input
                  type="number"
                  step="0.01"
                  value={descuentoTotal}
                  onChange={(e) =>
                    setDescuentoTotal(parseFloat(e.target.value) || 0)
                  }
                  className="w-24 px-2 py-1 border rounded text-right"
                />
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                <span>TOTAL A PAGAR:</span>
                <span>S/ {Number(totalFinal).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* NOTAS */}
        <div>
          <label className="block font-semibold mb-2">Notas (Opcional)</label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Agregar notas o términos especiales..."
            className="w-full px-3 py-2 border border-gray-300 rounded h-20"
          />
        </div>
      </Card.Content>
      <Card.Footer className="gap-2">
        <Button
          onClick={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
          className="flex-1 !bg-white !text-black border border-black hover:!bg-black hover:!text-white hover:border-white"
        >
          Guardar Cotización
        </Button>
      </Card.Footer>
    </Card>
  );
}
