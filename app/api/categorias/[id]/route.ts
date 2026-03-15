import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminFromToken } from "@/lib/permissions";
import { categoriaSchema } from "@/lib/validation";
import { ZodError } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const categoria = await db.categoria.findUnique({
      where: { id },
      include: {
        productos: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    if (!categoria) {
      return NextResponse.json(
        { message: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ categoria }, { status: 200 });
  } catch (error) {
    console.error("Get categoria error:", error);
    return NextResponse.json(
      { message: "Error al obtener categoría" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const validatedData = categoriaSchema.parse(body);

    const existingCategoria = await db.categoria.findUnique({
      where: { id },
    });

    if (!existingCategoria) {
      return NextResponse.json(
        { message: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    const updated = await db.categoria.update({
      where: { id },
      data: {
        nombre: validatedData.nombre,
        slug: validatedData.slug,
        descripcion: validatedData.descripcion,
        imagen: validatedData.imagen,
      },
    });

    return NextResponse.json(
      { success: true, categoria: updated },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Validación fallida", errors: error.issues },
        { status: 400 }
      );
    }

    console.error("Update categoria error:", error);
    return NextResponse.json(
      { message: "Error al actualizar categoría" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const existingCategoria = await db.categoria.findUnique({
      where: { id },
      include: {
        productos: true,
      },
    });

    if (!existingCategoria) {
      return NextResponse.json(
        { message: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    if (existingCategoria.productos.length > 0) {
      return NextResponse.json(
        { message: "No puedes eliminar una categoría que tiene productos" },
        { status: 400 }
      );
    }

    await db.categoria.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: "Categoría eliminada" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete categoria error:", error);
    return NextResponse.json(
      { message: "Error al eliminar categoría" },
      { status: 500 }
    );
  }
}
