import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const adminCount = await db.admin.count();

    return NextResponse.json(
      { adminExists: adminCount > 0 },
      { status: 200 }
    );
  } catch (error) {
    console.error("Check admin error:", error);
    return NextResponse.json(
      { message: "Error en el servidor" },
      { status: 500 }
    );
  }
}
