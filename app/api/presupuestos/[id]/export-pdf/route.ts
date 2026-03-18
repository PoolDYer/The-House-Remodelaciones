import { NextRequest, NextResponse } from "next/server";
import { verifyAdminFromToken } from "@/lib/permissions";
import { db as prisma } from "@/lib/db";
import jsPDF from "jspdf";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const urlToken = searchParams.get("token");
    
    // Si viene el token por la URL, lo inyectamos temporalmente en el header de la request actual
    // para que la función verifyAdmin pueda leerlo
    if (urlToken) {
      request.headers.set("authorization", `Bearer ${urlToken}`);
    }

    const auth = verifyAdminFromToken(request);
    if (!auth.valid) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Obtener presupuesto y configuración
    const [presupuesto, empresa] = await Promise.all([
      prisma.presupuesto.findUnique({
        where: { id },
        include: { lineas: { orderBy: { numero: "asc" } } },
      }),
      prisma.configuracionEmpresa.findFirst(),
    ]);

    if (!presupuesto) {
      return NextResponse.json(
        { message: "Presupuesto no encontrado" },
        { status: 404 }
      );
    }

    // Verificar autorización
    if (presupuesto.adminId !== auth.adminId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    // Crear PDF profesional
    const pdf = new jsPDF("portrait", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let y = margin;

    // ===== LOGO =====
    let logoWidth = 0;
    try {
      const logoPath = path.join(process.cwd(), "public", "logo.png");
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        const logoBase64 = logoBuffer.toString("base64");
        const logoData = `data:image/png;base64,${logoBase64}`;
        // Logo: 30mm ancho x 24mm alto (proporción 400x320)
        pdf.addImage(logoData, "PNG", margin, y - 2, 36, 30);
        logoWidth = 36 + 5; // ancho logo + margen
      }
    } catch (err) {
      console.warn("No se pudo cargar el logo");
    }

    // ===== ENCABEZADO =====
    const textStartX = margin + logoWidth;
    
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
   // pdf.text("THE HOUSE", textStartX, y + 4);
    
    pdf.setFontSize(8);
    if (empresa) {
      pdf.setFontSize(15);
      pdf.setFont("helvetica", "bold");
      pdf.text(`${empresa.nombreEmpresa || ""}`.toUpperCase(), textStartX, y + 4);
      pdf.setFontSize(8);

      pdf.setFont("helvetica", "normal");
      pdf.text(`RUC: ${empresa.ruc || ""}`, textStartX, y + 8);
      pdf.text(`${empresa.direccion || ""}`, textStartX, y + 12);
      pdf.text(`Teléfono: ${empresa.telefono || ""}`, textStartX, y + 16);
      pdf.text(`Email: ${empresa.email || ""}`, textStartX, y + 20);
      pdf.text(`Web: ${empresa.website || ""}`, textStartX, y + 24);
    }
    
    y += 30;

    // Número de presupuesto en caja
    const boxWidth = 55;
    const boxHeight = 22;
    const boxX = pageWidth - margin - boxWidth;
    const boxY = margin;
    pdf.setDrawColor(0, 0, 0);
    pdf.rect(boxX, boxY, boxWidth, boxHeight, "S");
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text("COTIZACIÓN", boxX + boxWidth / 2, boxY + 8, { align: "center" });
    pdf.setFontSize(12);
    pdf.text(presupuesto.numero, boxX + boxWidth / 2, boxY + 15, { align: "center" });

    // ===== CLIENTE =====
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.text("CLIENTE:", margin, y + 5);
    y += 5;

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${presupuesto.clienteNombre || ""}`, margin, y + 5);
    y += 4;
    if (presupuesto.clienteRuc) {
      pdf.text(`RUC: ${presupuesto.clienteRuc}`, margin, y + 6);
      y += 4;
    }
    if (presupuesto.clienteDireccion) {
      pdf.text(`Domicilio: ${presupuesto.clienteDireccion}`, margin, y + 6);
      y += 4;
    }
    if (presupuesto.clienteTelefono) {
      pdf.text(`Teléfono: ${presupuesto.clienteTelefono}`, margin, y + 6);
      y += 6;
    }

    // ===== TABLA TIPO EXCEL =====
    y += 7;
    const tableTop = y;
    const rowHeight = 6;

    // Definir columnas (x posición, ancho)
    const col = {
      cant: { x: margin, w: 20 },
      desc: { x: margin + 20, w: 90 },
      precioUnit: { x: margin + 110, w: 24 },
      descto: { x: margin + 134, w: 24 },
      total: { x: margin + 158, w: 22 }
    };

    const tableEndX = pageWidth - margin;

    // ENCABEZADO
    const headerY = y;
    pdf.setFillColor(230, 230, 230);
    pdf.rect(margin, headerY - 0.5, tableEndX - margin, rowHeight, "F");
    
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setDrawColor(180, 180, 180);
    
    // Dibujar línea superior
    pdf.line(margin, headerY - 0.5, tableEndX, headerY - 0.5);
    
    // Encabezado
    pdf.text("CANTIDAD", col.cant.x + col.cant.w / 2, headerY + 4, { align: "center" });
    pdf.text("DESCRIPCIÓN", col.desc.x, headerY + 4, { align: "left" });
    pdf.text("PRECIO UNITARIO", col.precioUnit.x + col.precioUnit.w - 2, headerY + 4, { align: "right" });
    pdf.text("DESCUENTO", col.descto.x + col.descto.w - 2, headerY + 4, { align: "right" });
    pdf.text("TOTAL", col.total.x + col.total.w - 2, headerY + 4, { align: "right" });
    
    // Línea inferior del encabezado
    pdf.line(margin, headerY + rowHeight - 0.5, tableEndX, headerY + rowHeight - 0.5);
    
    y += rowHeight;

    // DATOS - Filas de productos
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setDrawColor(150, 150, 150);

    presupuesto.lineas.forEach((linea: any, index: number) => {
      if (y + rowHeight > pageHeight - 30) {
        // Dibujar línea inferior de la tabla
        pdf.line(margin, y - 0.5, tableEndX, y - 0.5);
        
        pdf.addPage();
        y = margin;
        // Redibujar encabezado en nueva página
        pdf.setFillColor(230, 230, 230);
        pdf.rect(margin, y - 0.5, tableEndX - margin, rowHeight, "F");
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        pdf.line(margin, y - 0.5, tableEndX, y - 0.5);
        pdf.text("CANTIDAD", col.cant.x + col.cant.w / 2, y + 3.5, { align: "center" });
        pdf.text("DESCRIPCIÓN", col.desc.x, y + 3.5, { align: "left" });
        pdf.text("PRECIO UNITARIO", col.precioUnit.x + col.precioUnit.w - 2, y + 3.5, { align: "right" });
        pdf.text("DESCUENTO", col.descto.x + col.descto.w - 2, y + 3.5, { align: "right" });
        pdf.text("TOTAL", col.total.x + col.total.w - 2, y + 3.5, { align: "right" });
        pdf.line(margin, y + rowHeight - 0.5, tableEndX, y + rowHeight - 0.5);
        y += rowHeight;
        pdf.setFont("helvetica", "normal");
      }

      // Datos alineados con los encabezados
      pdf.text(String(Math.floor(linea.cantidad)), col.cant.x + col.cant.w / 2, y + 4, { align: "center" });

      const desc = String(linea.descripcion).substring(0, 50);
      pdf.text(desc, col.desc.x, y + 4);

      pdf.text(`${Number(linea.precioUnitario).toFixed(2)}`, col.precioUnit.x + col.precioUnit.w - 2, y + 4, { align: "right" });

      pdf.text(`${Number(linea.descuento).toFixed(2)}`, col.descto.x + col.descto.w - 2, y + 4, { align: "right" });

      pdf.text(`${Number(linea.subtotal).toFixed(2)}`, col.total.x + col.total.w - 2, y + 4, { align: "right" });
      
      // Línea inferior de la fila
      pdf.line(margin, y + rowHeight - 0.5, tableEndX, y + rowHeight - 0.5);

      y += rowHeight;
    });

    y += 4;

    // ===== TOTALES =====
    const valuesX = pageWidth - margin - 2;
    const labelsX = valuesX - 18;

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");

    pdf.text("Subtotal: S/", labelsX, y, { align: "right" });
    pdf.text(`${Number(presupuesto.subtotal).toFixed(2)}`, valuesX, y, { align: "right" });
    y += 5;

    pdf.text("Descuento Total: S/", labelsX, y, { align: "right" });
    pdf.text(`${Number(presupuesto.descuentoTotal).toFixed(2)}`, valuesX, y, { align: "right" });
    y += 5;

    if (Number(presupuesto.igvPorcentaje) > 0) {
      pdf.text(`IGV (${Number(presupuesto.igvPorcentaje)}%): S/`, labelsX, y, { align: "right" });
      pdf.text(`${Number(presupuesto.igvMonto).toFixed(2)}`, valuesX, y, { align: "right" });
      y += 5;
    }

    // Total final
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.text("TOTAL A PAGAR: S/", labelsX, y+2, { align: "right" });
    pdf.text(`${Number(presupuesto.total).toFixed(2)}`, valuesX, y + 2, { align: "right" });

    // Output a arraybuffer para descargas nativas
    const pdfArrayBuffer = pdf.output("arraybuffer");
    const pdfBuffer = Buffer.from(pdfArrayBuffer);

    // Enviar archivo físico con las cabeceras RESTRICTIVAS de descarga
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="cotizacion-${presupuesto.numero}.pdf"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      },
    });
  } catch (error) {
    console.error("Error generando PDF:", error);
    let errorMessage = "Error generando PDF";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { message: errorMessage, error: JSON.stringify(error) },
      { status: 500 }
    );
  }
}
