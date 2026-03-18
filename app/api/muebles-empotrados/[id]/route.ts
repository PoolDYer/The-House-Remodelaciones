import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminFromToken } from "@/lib/permissions";
import { muebleEmpotradoSchema } from "@/lib/validation";
import { ZodError } from "zod";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const mueble = await db.muebleEmpotrado.findUnique({
            where: { id },
            include: {
                categoria: true,
                imagenes: true,
            },
        });

        if (!mueble) {
            return NextResponse.json(
                { message: "Mueble no encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json({ mueble }, { status: 200 });
    } catch (error) {
        console.error("Get mueble empotrado error:", error);
        return NextResponse.json(
            { message: "Error al obtener mueble" },
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
            return NextResponse.json({ message: "No autorizado" }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = muebleEmpotradoSchema.parse(body);

        const existing = await db.muebleEmpotrado.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { message: "Mueble no encontrado" },
                { status: 404 }
            );
        }

        const updated = await db.muebleEmpotrado.update({
            where: { id },
            data: {
                nombre: validatedData.nombre,
                slug: validatedData.slug,
                descripcion: validatedData.descripcion,
                especificaciones: validatedData.especificaciones,
                categoriaId: validatedData.categoriaId,
            },
            include: {
                categoria: true,
                imagenes: true,
            },
        });

        return NextResponse.json(
            { success: true, mueble: updated },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { message: "Validación fallida", errors: error.issues },
                { status: 400 }
            );
        }

        console.error("Update mueble empotrado error:", error);
        return NextResponse.json(
            { message: "Error al actualizar mueble" },
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
            return NextResponse.json({ message: "No autorizado" }, { status: 401 });
        }

        const existing = await db.muebleEmpotrado.findUnique({
            where: { id },
            include: { imagenes: true },
        });

        if (!existing) {
            return NextResponse.json(
                { message: "Mueble no encontrado" },
                { status: 404 }
            );
        }

        // Delete associated images first
        if (existing.imagenes.length > 0) {
            await db.imagenMuebleEmpotrado.deleteMany({
                where: { muebleId: id },
            });
        }

        await db.muebleEmpotrado.delete({
            where: { id },
        });

        return NextResponse.json(
            { success: true, message: "Mueble eliminado" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Delete mueble empotrado error:", error);
        return NextResponse.json(
            { message: "Error al eliminar mueble" },
            { status: 500 }
        );
    }
}
