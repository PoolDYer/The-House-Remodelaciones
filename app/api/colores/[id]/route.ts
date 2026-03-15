import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminFromToken } from "@/lib/permissions";
import { colorSchema } from "@/lib/validation";
import { ZodError } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const color = await db.color.findUnique({
      where: { id },
      include: {
        categoriaColor: {
          select: {
            id: true,
            nombre: true,
            slug: true,
          },
        },
      },
    });

    if (!color) {
      return NextResponse.json(
        { message: "Color no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ color }, { status: 200 });
  } catch (error) {
    console.error("Get color error:", error);
    return NextResponse.json(
      { message: "Error al obtener color" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = verifyAdminFromToken(request);

    if (!auth.valid) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = colorSchema.parse(body);

    const color = await db.color.findUnique({
      where: { id },
    });

    if (!color) {
      return NextResponse.json(
        { message: "Color no encontrado" },
        { status: 404 }
      );
    }

    // Verify that the color category exists
    const categoriaColor = await db.categoriaColor.findUnique({
      where: { id: validatedData.categoriColorId },
    });

    if (!categoriaColor) {
      return NextResponse.json(
        { message: "Categoría de color no encontrada" },
        { status: 404 }
      );
    }

    if (validatedData.slug !== color.slug) {
      const existingSlug = await db.color.findUnique({
        where: { slug: validatedData.slug },
      });

      if (existingSlug) {
        return NextResponse.json(
          { message: "Ya existe un color con este slug" },
          { status: 400 }
        );
      }
    }

    const updated = await db.color.update({
      where: { id },
      data: {
        nombre: validatedData.nombre,
        slug: validatedData.slug,
        descripcion: validatedData.descripcion,
        especificaciones: validatedData.especificaciones,
        imagenColor: validatedData.imagenColor,
        imagenReferencia: validatedData.imagenReferencia,
        categoriColorId: validatedData.categoriColorId,
      },
      include: {
        categoriaColor: {
          select: {
            id: true,
            nombre: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(
      { success: true, color: updated },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Validación fallida", errors: error.issues },
        { status: 400 }
      );
    }

    console.error("Update color error:", error);
    return NextResponse.json(
      { message: "Error al actualizar color" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = verifyAdminFromToken(request);

    if (!auth.valid) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 401 }
      );
    }

    const color = await db.color.findUnique({
      where: { id },
    });

    if (!color) {
      return NextResponse.json(
        { message: "Color no encontrado" },
        { status: 404 }
      );
    }

    await db.color.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: "Color eliminado" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete color error:", error);
    return NextResponse.json(
      { message: "Error al eliminar color" },
      { status: 500 }
    );
  }
}
