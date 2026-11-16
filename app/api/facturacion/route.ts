import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { facturaSchema, serieFactura } from "@/lib/facturacion";
import { administradorFactura, errorFactura, NumeracionAgotada, sinAccesoFactura } from "@/lib/facturacion-server";

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
    const serie = serieFactura(datos.tipo);
    const factura = await db.$transaction(async tx => {
      const secuencia = await tx.serieFactura.upsert({ where: { serie }, create: { serie, ultimo: 1 }, update: { ultimo: { increment: 1 } } });
      if (secuencia.ultimo > 99999999) throw new NumeracionAgotada("La serie alcanzó su límite de numeración.");
      return tx.facturaPrueba.create({ data: { datos, adminId: admin.id, serie, correlativo: secuencia.ultimo } });
    });
    return NextResponse.json(factura, { status: 201 });
  } catch (error) { return errorFactura(error); }
}
