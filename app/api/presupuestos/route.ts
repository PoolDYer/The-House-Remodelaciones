import { NextRequest, NextResponse } from "next/server";
import { verifyAdminFromToken } from "@/lib/permissions";
import { db as prisma } from "@/lib/db";
import { PresupuestoCreateSchema } from "@/lib/validation-presupuesto";
import {
  calcularSubtotalLinea,
  calcularSubtotalPresupuesto,
  calcularIGV,
  calcularTotal,
} from "@/lib/presupuestos";

export async function GET(request: NextRequest) {
  try {
    const auth = verifyAdminFromToken(request);
    if (!auth.valid) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const estado = searchParams.get("estado");
    const clienteNombre = searchParams.get("clienteNombre");

    const where = {
      adminId: auth.adminId,
      ...(estado && { estado }),
      ...(clienteNombre && {
        clienteNombre: { contains: clienteNombre, mode: "insensitive" as const },
      }),
    };

    const presupuestos = await prisma.presupuesto.findMany({
      where,
      include: { lineas: { orderBy: { numero: "asc" } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(presupuestos);
  } catch (error) {
    console.error("Error obteniendo presupuestos:", error);
    return NextResponse.json(
      { message: "Error obteniendo presupuestos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = verifyAdminFromToken(request);
    if (!auth.valid) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = PresupuestoCreateSchema.parse(body);

    // Generar número único más rápido - usando timestamp + aleatorio
    const año = new Date().getFullYear();
    const timeStamp = Date.now().toString().slice(-6); // últimos 6 dígitos del timestamp
    const numero = `COT-${año}-${timeStamp}`;

    // Calcular subtotales de líneas
    const lineasConSubtotales = validatedData.lineas.map((linea) => ({
      ...linea,
      subtotal: calcularSubtotalLinea(
        linea.cantidad,
        linea.precioUnitario,
        linea.descuento
      ),
    }));

    // Calcular totales
    const subtotal = calcularSubtotalPresupuesto(lineasConSubtotales);
    const igvMonto = calcularIGV(subtotal, validatedData.igvPorcentaje);
    const total = calcularTotal(
      subtotal,
      igvMonto,
      validatedData.descuentoTotal || 0
    );

    // Crear presupuesto
    const presupuesto = await prisma.presupuesto.create({
      data: {
        numero,
        estado: "borrador",
        clienteNombre: validatedData.clienteNombre,
        clienteRuc: validatedData.clienteRuc || null,
        clienteDireccion: validatedData.clienteDireccion || null,
        clienteTelefono: validatedData.clienteTelefono || null,
        clienteEmail: validatedData.clienteEmail || null,
        fechaValidez: validatedData.fechaValidez
          ? new Date(validatedData.fechaValidez)
          : null,
        subtotal,
        igvPorcentaje: validatedData.igvPorcentaje,
        igvMonto,
        descuentoTotal: validatedData.descuentoTotal || 0,
        total,
        notas: validatedData.notas || null,
        adminId: auth.adminId!,
        lineas: {
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
        },
      },
      include: { lineas: { orderBy: { numero: "asc" } } },
    });

    return NextResponse.json(presupuesto, { status: 201 });
  } catch (error) {
    console.error("Error creando presupuesto:", error);
    
    // Devolver detalles del error para debugging
    let errorMessage = "Error creando presupuesto";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { message: errorMessage, error: JSON.stringify(error) },
      { status: 500 }
    );
  }
}
