import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminFromToken } from "@/lib/permissions";

// GET - Public: Get a single publication by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const publicacion = await db.publicacion.findUnique({
      where: { id },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
          },
        },
        media: {
          select: {
            id: true,
            url: true,
            tipo: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!publicacion) {
      return NextResponse.json(
        { message: "Publicación no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ publicacion }, { status: 200 });
  } catch (error) {
    console.error("Error al obtener publicación:", error);
    return NextResponse.json(
      { message: "Error al obtener publicación" },
      { status: 500 }
    );
  }
}

// DELETE - Protected: Delete a publication
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = verifyAdminFromToken(request);

    if (!auth.valid) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const publicacion = await db.publicacion.findUnique({
      where: { id },
    });

    if (!publicacion) {
      return NextResponse.json(
        { message: "Publicación no encontrada" },
        { status: 404 }
      );
    }

    // All authenticated admins can delete any publication

    await db.publicacion.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: "Publicación eliminada" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar publicación:", error);
    return NextResponse.json(
      { message: "Error al eliminar publicación" },
      { status: 500 }
    );
  }
}
