import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminFromToken } from "@/lib/permissions";
import { categoriaColorSchema } from "@/lib/validation";
import { ZodError } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoria = await db.categoriaColor.findUnique({
      where: { id },
      include: {
        colores: {
          select: {
            id: true,
            nombre: true,
            slug: true,
            descripcion: true,
            imagenColor: true,
            imagenReferencia: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!categoria) {
      return NextResponse.json(
        { message: "Categoría de color no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ categoria }, { status: 200 });
  } catch (error) {
    console.error("Get categoria color error:", error);
    return NextResponse.json(
      { message: "Error al obtener categoría de color" },
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
    const validatedData = categoriaColorSchema.parse(body);

    const categoria = await db.categoriaColor.findUnique({
      where: { id },
    });

    if (!categoria) {
      return NextResponse.json(
        { message: "Categoría de color no encontrada" },
        { status: 404 }
      );
    }

    if (validatedData.slug !== categoria.slug) {
      const existingSlug = await db.categoriaColor.findUnique({
        where: { slug: validatedData.slug },
      });

      if (existingSlug) {
        return NextResponse.json(
          { message: "Ya existe una categoría de color con este slug" },
          { status: 400 }
        );
      }
    }

    const updated = await db.categoriaColor.update({
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

    console.error("Update categoria color error:", error);
    return NextResponse.json(
      { message: "Error al actualizar categoría de color" },
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

    const categoria = await db.categoriaColor.findUnique({
      where: { id },
      include: {
        colores: true,
      },
    });

    if (!categoria) {
      return NextResponse.json(
        { message: "Categoría de color no encontrada" },
        { status: 404 }
      );
    }

    if (categoria.colores.length > 0) {
      return NextResponse.json(
        { message: "No se puede eliminar una categoría que contiene colores" },
        { status: 400 }
      );
    }

    await db.categoriaColor.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: "Categoría de color eliminada" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete categoria color error:", error);
    return NextResponse.json(
      { message: "Error al eliminar categoría de color" },
      { status: 500 }
    );
  }
}
