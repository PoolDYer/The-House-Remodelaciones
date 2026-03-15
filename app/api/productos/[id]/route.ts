import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminFromToken } from "@/lib/permissions";
import { productoSchema } from "@/lib/validation";
import { ZodError } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const producto = await db.producto.findUnique({
      where: { id },
      include: {
        categoria: true,
        imagenes: true,
      },
    });

    if (!producto) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ producto }, { status: 200 });
  } catch (error) {
    console.error("Get producto error:", error);
    return NextResponse.json(
      { message: "Error al obtener producto" },
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
    const validatedData = productoSchema.parse(body);

    const existingProducto = await db.producto.findUnique({
      where: { id },
    });

    if (!existingProducto) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }

    const updated = await db.producto.update({
      where: { id },
      data: {
        nombre: validatedData.nombre,
        slug: validatedData.slug,
        descripcion: validatedData.descripcion,
        precio: validatedData.precio,
        especificaciones: validatedData.especificaciones,
        stock: validatedData.stock,
        categoriaId: validatedData.categoriaId,
      },
      include: {
        categoria: true,
        imagenes: true,
      },
    });

    return NextResponse.json(
      { success: true, producto: updated },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Validación fallida", errors: error.issues },
        { status: 400 }
      );
    }

    console.error("Update producto error:", error);
    return NextResponse.json(
      { message: "Error al actualizar producto" },
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

    const existingProducto = await db.producto.findUnique({
      where: { id },
      include: {
        imagenes: true,
      },
    });

    if (!existingProducto) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Delete associated images
    if (existingProducto.imagenes.length > 0) {
      await db.imagen.deleteMany({
        where: { productoId: id },
      });
    }

    await db.producto.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: "Producto eliminado" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete producto error:", error);
    return NextResponse.json(
      { message: "Error al eliminar producto" },
      { status: 500 }
    );
  }
}
