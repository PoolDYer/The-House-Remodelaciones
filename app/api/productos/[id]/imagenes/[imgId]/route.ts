import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminFromToken } from "@/lib/permissions";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imgId: string }> }
) {
  const { id, imgId } = await params;

  try {
    const auth = verifyAdminFromToken(request);

    if (!auth.valid) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 401 }
      );
    }

    const imagen = await db.imagen.findUnique({
      where: { id: imgId },
    });

    if (!imagen) {
      return NextResponse.json(
        { message: "Imagen no encontrada" },
        { status: 404 }
      );
    }

    if (imagen.productoId !== id) {
      return NextResponse.json(
        { message: "Imagen no pertenece a este producto" },
        { status: 400 }
      );
    }

    await db.imagen.delete({
      where: { id: imgId },
    });

    return NextResponse.json(
      { success: true, message: "Imagen eliminada" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete imagen error:", error);
    return NextResponse.json(
      { message: "Error al eliminar imagen" },
      { status: 500 }
    );
  }
}
