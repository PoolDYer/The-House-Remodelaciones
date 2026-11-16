import { NextRequest } from "next/server";
import { facturaSchema } from "@/lib/facturacion";
import { generarFacturaPDF } from "@/lib/factura-pdf";
import { administradorFactura, errorFactura, respuestaPDF, sinAccesoFactura } from "@/lib/facturacion-server";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  try {
    if (!await administradorFactura(request)) return sinAccesoFactura();
    const datos = facturaSchema.parse(await request.json());
    return respuestaPDF(generarFacturaPDF(datos), "comprobante-borrador");
  } catch (error) { return errorFactura(error); }
}
