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
            return NextResponse.json({ message: "No autorizado" }, { status: 401 });
        }

        const body = await request.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json(
                { message: "URL de imagen requerida" },
                { status: 400 }
            );
        }

        // Verify mueble exists
        const mueble = await db.muebleEmpotrado.findUnique({
            where: { id },
        });

        if (!mueble) {
            return NextResponse.json(
                { message: "Mueble no encontrado" },
                { status: 404 }
            );
        }

        const imagen = await db.imagenMuebleEmpotrado.create({
            data: {
                url,
                muebleId: id,
            },
        });

        return NextResponse.json(
            { success: true, imagen },
            { status: 201 }
        );
    } catch (error) {
        console.error("Add imagen mueble empotrado error:", error);
        return NextResponse.json(
            { message: "Error al agregar imagen" },
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

        const { searchParams } = new URL(request.url);
        const imagenId = searchParams.get("imagenId");

        if (!imagenId) {
            return NextResponse.json(
                { message: "ID de imagen requerido" },
                { status: 400 }
            );
        }

        const imagen = await db.imagenMuebleEmpotrado.findUnique({
            where: { id: imagenId },
        });

        if (!imagen || imagen.muebleId !== id) {
            return NextResponse.json(
                { message: "Imagen no encontrada" },
                { status: 404 }
            );
        }

        await db.imagenMuebleEmpotrado.delete({
            where: { id: imagenId },
        });

        return NextResponse.json(
            { success: true, message: "Imagen eliminada" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Delete imagen mueble empotrado error:", error);
        return NextResponse.json(
            { message: "Error al eliminar imagen" },
            { status: 500 }
        );
    }
}
