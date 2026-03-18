import { NextRequest, NextResponse } from "next/server";
import { verifyAdminFromToken } from "@/lib/permissions";
import { db as prisma } from "@/lib/db";
import { PresupuestoUpdateSchema } from "@/lib/validation-presupuesto";
import {
  calcularSubtotalLinea,
  calcularSubtotalPresupuesto,
  calcularIGV,
  calcularTotal,
} from "@/lib/presupuestos";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = verifyAdminFromToken(request);
    if (!auth.valid) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const presupuesto = await prisma.presupuesto.findUnique({
      where: { id },
      include: { lineas: { orderBy: { numero: "asc" } } },
    });

    if (!presupuesto) {
      return NextResponse.json(
        { message: "Presupuesto no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que pertenece al admin autenticado
    if (presupuesto.adminId !== auth.adminId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    return NextResponse.json(presupuesto);
  } catch (error) {
    console.error("Error obteniendo presupuesto:", error);
    return NextResponse.json(
      { message: "Error obteniendo presupuesto" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = verifyAdminFromToken(request);
    if (!auth.valid) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const validatedData = PresupuestoUpdateSchema.partial().parse(body);

    // Usar transacción para operaciones conjuntas
    const presupuestoActualizado = await prisma.$transaction(async (tx) => {
      // Verificar que presupuesto existe y pertenece al admin
      const presupuesto = await tx.presupuesto.findUnique({
        where: { id },
        include: { lineas: true },
      });

      if (!presupuesto) {
        throw new Error("Presupuesto no encontrado");
      }

      if (presupuesto.adminId !== auth.adminId) {
        throw new Error("No autorizado");
      }

      // Si se actualiza lineas, recalcular todos los totales
      let lineasConSubtotales: any[] = presupuesto.lineas;
      if (validatedData.lineas && validatedData.lineas.length > 0) {
        lineasConSubtotales = validatedData.lineas.map((linea) => ({
          ...linea,
          subtotal: calcularSubtotalLinea(
            linea.cantidad,
            linea.precioUnitario,
            linea.descuento
          ),
        }));

        // Eliminar líneas antiguas
        await tx.lineaPresupuesto.deleteMany({
          where: { presupuestoId: id },
        });
      }

      // Calcular nuevos totales
      const subtotal = calcularSubtotalPresupuesto(lineasConSubtotales);
      const igvPorcentaje =
        validatedData.igvPorcentaje || presupuesto.igvPorcentaje;
      const igvMonto = calcularIGV(subtotal, igvPorcentaje);
      const descuentoTotal =
        validatedData.descuentoTotal || presupuesto.descuentoTotal;
      const total = calcularTotal(subtotal, igvMonto, descuentoTotal);

      // Actualizar presupuesto
      return await tx.presupuesto.update({
        where: { id },
        data: {
          clienteNombre: validatedData.clienteNombre || presupuesto.clienteNombre,
          clienteRuc: validatedData.clienteRuc ?? presupuesto.clienteRuc,
          clienteDireccion:
            validatedData.clienteDireccion ?? presupuesto.clienteDireccion,
          clienteTelefono:
            validatedData.clienteTelefono ?? presupuesto.clienteTelefono,
          clienteEmail: validatedData.clienteEmail ?? presupuesto.clienteEmail,
          fechaValidez: validatedData.fechaValidez
            ? new Date(validatedData.fechaValidez)
            : presupuesto.fechaValidez,
          subtotal,
          igvPorcentaje,
          igvMonto,
          descuentoTotal,
          total,
          notas: validatedData.notas ?? presupuesto.notas,
          lineas: validatedData.lineas
            ? {
                createMany: {
                  data: lineasConSubtotales.map((linea, idx) => ({
                    numero: idx + 1,
                    descripcion: linea.descripcion,
                    cantidad: linea.cantidad,
                    precioUnitario: linea.precioUnitario,
                    descuento: linea.descuento,
                    subtotal: linea.subtotal,
                  })),
                },
              }
            : undefined,
        },
        include: { lineas: { orderBy: { numero: "asc" } } },
      });
    });

    return NextResponse.json(presupuestoActualizado);
  } catch (error) {
    console.error("Error actualizando presupuesto:", error);
    let errorMessage = "Error actualizando presupuesto";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { message: errorMessage },
      { status: error instanceof Error && error.message === "No autorizado" ? 403 : 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = verifyAdminFromToken(request);
    if (!auth.valid) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const presupuesto = await prisma.presupuesto.findUnique({
      where: { id },
    });

    if (!presupuesto) {
      return NextResponse.json(
        { message: "Presupuesto no encontrado" },
        { status: 404 }
      );
    }

    if (presupuesto.adminId !== auth.adminId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    await prisma.presupuesto.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Presupuesto eliminado" });
  } catch (error) {
    console.error("Error eliminando presupuesto:", error);
    let errorMessage = "Error eliminando presupuesto";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { message: errorMessage, error: JSON.stringify(error) },
      { status: 500 }
    );
  }
}
