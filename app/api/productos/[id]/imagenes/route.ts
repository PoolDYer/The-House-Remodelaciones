import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminFromToken } from "@/lib/permissions";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const auth = verifyAdminFromToken(request);

    if (!auth.valid) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { message: "URL de imagen es requerida" },
        { status: 400 }
      );
    }

    // Verify product exists
    const producto = await db.producto.findUnique({
      where: { id },
    });

    if (!producto) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Create image
    const imagen = await db.imagen.create({
      data: {
        url,
        productoId: id,
      },
    });

    return NextResponse.json(
      { success: true, imagen },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create imagen error:", error);
    return NextResponse.json(
      { message: "Error al agregar imagen" },
      { status: 500 }
    );
  }
}
