import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { facturaSchema } from "@/lib/facturacion";
import { administradorFactura, errorFactura, sinAccesoFactura } from "@/lib/facturacion-server";

export async function GET(request: NextRequest) {
  try {
    const admin = await administradorFactura(request);
    if (!admin) return sinAccesoFactura();
    const facturas = await db.facturaPrueba.findMany({ where: { adminId: admin.id }, orderBy: { numero: "desc" } });
    return NextResponse.json(facturas, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return errorFactura(error); }
}
export async function POST(request: NextRequest) {
  try {
    const admin = await administradorFactura(request);
    if (!admin) return sinAccesoFactura();
    const datos = facturaSchema.parse(await request.json());
    const factura = await db.facturaPrueba.create({ data: { datos, adminId: admin.id } });
    return NextResponse.json(factura, { status: 201 });
  } catch (error) { return errorFactura(error); }
}
