import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { verifyAdminFromToken } from "@/lib/permissions";
import { db } from "@/lib/db";

export async function administradorFactura(request: NextRequest) {
  const auth = verifyAdminFromToken(request);
  if (!auth.valid || !auth.adminId) return null;
  // Comprueba también que la cuenta siga existiendo.
  return db.admin.findFirst({ where: { id: auth.adminId, role: "admin" }, select: { id: true } });
}
export function errorFactura(error: unknown) {
  if (error instanceof ZodError) return NextResponse.json({ message: error.issues[0]?.message, errors: error.issues }, { status: 400 });
  if (error instanceof SyntaxError) return NextResponse.json({ message: "Datos JSON inválidos" }, { status: 400 });
  console.error("Error de facturación:", error);
  return NextResponse.json({ message: "No se pudo completar la operación. Inténtalo de nuevo." }, { status: 500 });
}
export const sinAccesoFactura = () => NextResponse.json({ message: "Sesión no válida. Vuelve a iniciar sesión." }, { status: 401 });
export function respuestaPDF(buffer: ArrayBuffer, nombre: string, descargar = false) {
  return new NextResponse(buffer, { headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": `${descargar ? "attachment" : "inline"}; filename="${nombre}.pdf"`,
    "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff",
  } });
}
