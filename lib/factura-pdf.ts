import jsPDF from "jspdf";
import fs from "node:fs";
import path from "node:path";
import { calcularFactura, numeroFactura, type FacturaDatos } from "./facturacion";

export function generarFacturaPDF(datos: FacturaDatos, numero?: number): ArrayBuffer {
  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const ink = "#17283F", textColor = "#252B33", muted = "#626A74", rule = "#CFD3D9";
  const left = 18, right = 192, width = right - left;
  const referencia = numeroFactura(numero);
  const totales = calcularFactura(datos);
  const money = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const date = (s: string) => s.split("-").reverse().join("/");
  let y = 20;

  function text(value: string, x: number, top: number, size = 9, bold = false, color = textColor, align: "left" | "right" | "center" = "left") {
    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setFontSize(size); pdf.setTextColor(color); pdf.text(value, x, top, { align });
  }
  function line(top: number, color = rule, thickness = 0.2, start = left, end = right) {
    pdf.setDrawColor(color); pdf.setLineWidth(thickness); pdf.line(start, top, end, top);
  }
  function wrap(value: string, maxWidth: number, size = 9): string[] {
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(size);
    return pdf.splitTextToSize(value, maxWidth);
  }
  function paragraph(value: string, x: number, top: number, maxWidth: number, size = 9, bold = false, color = textColor) {
    const lines = wrap(value, maxWidth, size);
    lines.forEach((value, i) => text(value, x, top + i * 4.2, size, bold, color));
    return top + lines.length * 4.2;
  }
  function continuation() {
    pdf.addPage();
    text(datos.empresa.nombre.slice(0, 62), left, 18, 9, true, ink);
    text(`${datos.tipo.toUpperCase()} / ${referencia}`, right, 18, 9, false, ink, "right");
    line(23, ink, 0.35); y = 30;
  }
  function ensure(height: number) { if (y + height > 266) continuation(); }

  pdf.setProperties({ title: `${datos.tipo} ${referencia}`, subject: `${datos.tipo} ${referencia}`, author: datos.empresa.nombre });
  // Encabezado empresarial e identificación del comprobante.
  line(17, ink, 0.5);
  let companyX = left;
  try {
    const logo = new Uint8Array(fs.readFileSync(path.join(process.cwd(), "public/logo.png")));
    const props = pdf.getImageProperties(logo);
    const imageWidth = 23, imageHeight = imageWidth * props.height / props.width;
    pdf.addImage(logo, "PNG", left, 24, imageWidth, imageHeight);
    companyX = 47;
  } catch { /* La razón social identifica al emisor si el logo no está disponible. */ }
  let companyY = paragraph(datos.empresa.nombre, companyX, 29, 81, 11, true, ink) + 2;
  if (datos.empresa.ruc) { text(`RUC ${datos.empresa.ruc}`, companyX, companyY, 8.5, true); companyY += 5; }
  if (datos.empresa.direccion) companyY = paragraph(datos.empresa.direccion, companyX, companyY, 81, 8, false, muted);
  if (datos.empresa.telefono) { text(`Tel. ${datos.empresa.telefono}`, companyX, companyY, 8, false, muted); companyY += 4.5; }
  if (datos.empresa.email) companyY = paragraph(datos.empresa.email, companyX, companyY, 81, 8, false, muted);

  pdf.setDrawColor(ink); pdf.setLineWidth(0.35); pdf.rect(137, 23, 55, 35);
  text(datos.empresa.ruc ? `RUC ${datos.empresa.ruc}` : "COMPROBANTE", 164.5, 30, 9, true, ink, "center");
  pdf.setFont("times", "normal"); pdf.setFontSize(21); pdf.setTextColor(ink);
  pdf.text(datos.tipo.toUpperCase(), 164.5, 41, { align: "center" });
  line(45, rule, 0.2, 137, 192);
  text(referencia, 164.5, 53, 11, true, ink, "center");
  y = Math.max(companyY + 7, 74);
  line(y, ink, 0.35); y += 9;

  const clientTop = y;
  text("SEÑOR(ES)", left, y, 7.5, true, muted);
  y = paragraph(datos.cliente.nombre, left, y + 6, 105, 10, true, ink);
  text(`${datos.cliente.tipoDocumento} ${datos.cliente.documento}`, left, y + 1, 8.5); y += 7;
  if (datos.cliente.direccion) y = paragraph(datos.cliente.direccion, left, y, 105, 8.5, false, muted);
  if (datos.cliente.email) y = paragraph(datos.cliente.email, left, y, 105, 8, false, muted);
  for (const [label, value, offset] of [
    ["Fecha de emisión", date(datos.fecha), 0],
    ["Vencimiento", date(datos.vencimiento), 7],
    ["Moneda", datos.moneda === "PEN" ? "Soles (PEN)" : "Dólares (USD)", 14],
    ["Forma de pago", datos.pago, 21],
  ] as const) {
    text(label, 132, clientTop + offset, 8, false, muted);
    text(value, right, clientTop + offset, 8.5, true, textColor, "right");
  }
  y = Math.max(y + 9, clientTop + 33);

  function tableHeader() {
    pdf.setFillColor("#F1F2F4"); pdf.rect(left, y, width, 9, "F");
    line(y, ink, 0.35); line(y + 9, rule);
    text("Ítem", 20, y + 5.8, 7.5, true, ink);
    text("Descripción del bien o servicio", 28, y + 5.8, 7.5, true, ink);
    text("Unidad", 98, y + 5.8, 7.5, true, ink, "center");
    for (const [label, x] of [["Cant.", 117], ["P. unitario", 142], ["Dscto.", 163], ["Importe", 190]] as const) text(label, x, y + 5.8, 7.5, true, ink, "right");
    y += 9;
  }
  const rowHeight = (descripcion: string) => Math.max(15, wrap(descripcion, 60, 8.5).length * 4.2 + 8);
  ensure(9 + rowHeight(datos.lineas[0].descripcion)); tableHeader();
  datos.lineas.forEach((item, i) => {
    const height = rowHeight(item.descripcion);
    if (y + height > 266) { continuation(); tableHeader(); }
    text(String(i + 1).padStart(2, "0"), 20, y + 6.5, 8, false, muted);
    paragraph(item.descripcion, 28, y + 6.5, 60, 8.5);
    text(item.unidad, 98, y + 6.5, 7.5, false, muted, "center");
    text(item.cantidad.toLocaleString("en-US", { maximumFractionDigits: 3 }), 117, y + 6.5, 8, false, textColor, "right");
    text(money(item.precio), 142, y + 6.5, 8, false, textColor, "right");
    text(money(item.descuento), 163, y + 6.5, 8, false, textColor, "right");
    text(money(totales.lineas[i].neto), 190, y + 6.5, 8.5, true, textColor, "right");
    y += height; line(y);
  });

  y += 10; ensure(54);
  const summaryTop = y;
  text("CONDICIONES DE PAGO", left, y + 1, 7.5, true, ink);
  text(datos.pago, left, y + 7, 9);
  text(`Vencimiento: ${date(datos.vencimiento)}`, left, y + 13, 8, false, muted);
  text("Precios unitarios expresados sin IGV.", left, y + 20, 7.5, false, muted);
  const totals = [["Subtotal", totales.bruto], ["Descuentos", -totales.descuentos], ["Base imponible", totales.base], [`IGV (${datos.igv}%)`, totales.igv]] as const;
  totals.forEach(([label, value], i) => {
    text(label, 122, summaryTop + i * 6.5, 8.5, false, muted);
    text(money(value), right, summaryTop + i * 6.5, 9, false, textColor, "right");
  });
  line(summaryTop + 25, ink, 0.35, 122, right);
  text(`TOTAL ${datos.moneda === "PEN" ? "S/" : "US$"}`, 122, summaryTop + 35, 10, true, ink);
  text(money(totales.total), right, summaryTop + 35, 16, true, ink, "right");
  line(summaryTop + 41, ink, 0.5, 122, right);
  if (datos.notas) {
    y = summaryTop + 31;
    text("OBSERVACIONES", left, y, 7.5, true, ink); y += 6;
    wrap(datos.notas, 93, 8).forEach(value => {
      if (y + 5 > 266) { continuation(); text("OBSERVACIONES (CONTINUACIÓN)", left, y, 7.5, true, ink); y += 7; }
      text(value, left, y, 8, false, muted); y += 4;
    });
  }
  for (let page = 1; page <= pdf.getNumberOfPages(); page++) {
    pdf.setPage(page); line(276, ink, 0.35);
    text(referencia, left, 282, 7, false, muted);
    text(`${page} / ${pdf.getNumberOfPages()}`, right, 282, 7, false, muted, "right");
  }
  return pdf.output("arraybuffer");
}
