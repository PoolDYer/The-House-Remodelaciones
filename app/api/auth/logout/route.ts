import { NextRequest, NextResponse } from "next/server";
import { revokeRefreshToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    return NextResponse.json(
      { success: true, message: "Sesión cerrada exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { message: "Error en el servidor" },
      { status: 500 }
    );
  }
}
