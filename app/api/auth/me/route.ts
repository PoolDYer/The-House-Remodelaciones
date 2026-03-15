import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminFromToken } from "@/lib/permissions";

export async function GET(request: NextRequest) {
  try {
    const auth = verifyAdminFromToken(request);

    if (!auth.valid || !auth.adminId) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 401 }
      );
    }

    const admin = await db.admin.findUnique({
      where: { id: auth.adminId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { message: "Admin no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ admin }, { status: 200 });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { message: "Error en el servidor" },
      { status: 500 }
    );
  }
}
