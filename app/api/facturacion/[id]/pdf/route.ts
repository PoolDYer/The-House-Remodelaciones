import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { facturaSchema, numeroFactura } from "@/lib/facturacion";
import { generarFacturaPDF } from "@/lib/factura-pdf";
import { administradorFactura, errorFactura, respuestaPDF, sinAccesoFactura } from "@/lib/facturacion-server";

export const runtime = "nodejs";
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await administradorFactura(request);
    if (!admin) return sinAccesoFactura();
    const { id } = await params;
    const factura = await db.facturaPrueba.findFirst({ where: { id, adminId: admin.id } });
    if (!factura) return NextResponse.json({ message: "Comprobante no encontrado" }, { status: 404 });
    return respuestaPDF(generarFacturaPDF(facturaSchema.parse(factura.datos), factura.numero, factura.serie, factura.correlativo), numeroFactura(factura.numero, factura.serie, factura.correlativo), request.nextUrl.searchParams.get("download") === "1");
  } catch (error) { return errorFactura(error); }
}
