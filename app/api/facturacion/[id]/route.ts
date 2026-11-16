import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { facturaSchema } from "@/lib/facturacion";
import { administradorFactura, errorFactura, sinAccesoFactura } from "@/lib/facturacion-server";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await administradorFactura(request);
    if (!admin) return sinAccesoFactura();
    const { id } = await params;
    const datos = facturaSchema.parse(await request.json());
    const anterior = await db.facturaPrueba.findFirst({ where: { id, adminId: admin.id } });
    if (!anterior) return NextResponse.json({ message: "Comprobante no encontrado" }, { status: 404 });
    if (facturaSchema.parse(anterior.datos).tipo !== datos.tipo) return NextResponse.json({ message: "El tipo de un comprobante numerado no se puede cambiar. Crea un nuevo comprobante." }, { status: 409 });
    const result = await db.facturaPrueba.updateMany({ where: { id, adminId: admin.id }, data: { datos } });
    if (!result.count) return NextResponse.json({ message: "Comprobante no encontrado" }, { status: 404 });
    return NextResponse.json(await db.facturaPrueba.findFirst({ where: { id, adminId: admin.id } }));
  } catch (error) { return errorFactura(error); }
}
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await administradorFactura(request);
    if (!admin) return sinAccesoFactura();
    const { id } = await params;
    const result = await db.facturaPrueba.deleteMany({ where: { id, adminId: admin.id } });
    if (!result.count) return NextResponse.json({ message: "Comprobante no encontrado" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) { return errorFactura(error); }
}
