import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminFromToken } from "@/lib/permissions";
import { categoriaMuebleEmpotradoSchema } from "@/lib/validation";
import { ZodError } from "zod";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const categoria = await db.categoriaMuebleEmpotrado.findUnique({
            where: { id },
            include: {
                muebles: {
                    include: {
                        imagenes: true,
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
        console.error("Get categoría mueble empotrado error:", error);
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
            return NextResponse.json({ message: "No autorizado" }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = categoriaMuebleEmpotradoSchema.parse(body);

        const existing = await db.categoriaMuebleEmpotrado.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { message: "Categoría no encontrada" },
                { status: 404 }
            );
        }

        const updated = await db.categoriaMuebleEmpotrado.update({
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

        console.error("Update categoría mueble empotrado error:", error);
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
            return NextResponse.json({ message: "No autorizado" }, { status: 401 });
        }

        const existing = await db.categoriaMuebleEmpotrado.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { message: "Categoría no encontrada" },
                { status: 404 }
            );
        }

        await db.categoriaMuebleEmpotrado.delete({
            where: { id },
        });

        return NextResponse.json(
            { success: true, message: "Categoría eliminada" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Delete categoría mueble empotrado error:", error);
        return NextResponse.json(
            { message: "Error al eliminar categoría" },
            { status: 500 }
        );
    }
}
