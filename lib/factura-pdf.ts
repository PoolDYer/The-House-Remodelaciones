import jsPDF from "jspdf";
import fs from "node:fs";
import path from "node:path";
import { calcularFactura, importeEnLetras, nombreComprobante, numeroFactura, serieFactura, type FacturaDatos } from "./facturacion";

export function generarFacturaPDF(datos: FacturaDatos, numero?: number, serie?: string | null, correlativo?: number | null): ArrayBuffer {
  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const black = "#151515", gray = "#8B8B8B", border = "#B7B7B7", blue = "#69C9EF";
  const left = 13, right = 197, width = right - left;
  const referencia = numeroFactura(numero, serie ?? (numero ? undefined : serieFactura(datos.tipo)), correlativo);
  const denominacion = nombreComprobante(datos.tipo);
  const totales = calcularFactura(datos);
  const currency = datos.moneda === "PEN" ? "S/" : "US$";
  const money = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const date = (s: string) => s.split("-").reverse().join("/");
  const leading = 3.25;
  let y = 12;

  function text(value: string, x: number, top: number, size = 7.5, bold = false, color = black, align: "left" | "right" | "center" = "left") {
    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setFontSize(size); pdf.setTextColor(color); pdf.text(value, x, top, { align });
  }
  function wrap(value: string, maxWidth: number, size = 7.5, bold = false): string[] {
    pdf.setFont("helvetica", bold ? "bold" : "normal"); pdf.setFontSize(size);
    return pdf.splitTextToSize(value, maxWidth);
  }
  function paragraph(value: string, x: number, top: number, maxWidth: number, size = 7.5, bold = false) {
    const lines = wrap(value, maxWidth, size, bold);
    lines.forEach((value, i) => text(value, x, top + i * leading, size, bold));
    return top + lines.length * leading;
  }
  function line(top: number, start = left, end = right) {
    pdf.setDrawColor(border); pdf.setLineWidth(0.18); pdf.line(start, top, end, top);
  }
  function box(x: number, top: number, w: number, h: number, fill?: string) {
    pdf.setDrawColor(border); pdf.setLineWidth(0.22);
    if (fill) pdf.setFillColor(fill);
    pdf.roundedRect(x, top, w, h, 1.2, 1.2, fill ? "FD" : "S");
  }
  function continuation() {
    pdf.addPage();
    const end = paragraph(datos.empresa.nombre, left, 13, 100, 8, true);
    text(denominacion.toUpperCase(), right, 13, 7.5, true, black, "right");
    text(referencia, right, 17, 8, true, black, "right");
    y = Math.max(end + 2, 22); line(y); y += 3;
  }
  function ensure(height: number) { if (y + height > 274) continuation(); }
  pdf.setProperties({ title: `${denominacion} ${referencia}`, subject: `${denominacion} ${referencia}`, author: datos.empresa.nombre });

  // Helvetica regular/negrita mantiene el estilo sans serif de la referencia.
  let brandX = left;
  try {
    const logo = new Uint8Array(fs.readFileSync(path.join(process.cwd(), "public/logo.png")));
    const props = pdf.getImageProperties(logo);
    pdf.addImage(logo, "PNG", left, 12, 25, 25 * props.height / props.width);
    brandX = 42;
  } catch { /* La razón social sigue identificando al emisor. */ }
  const brandEnd = paragraph(datos.empresa.nombre, brandX, 18, 129 - brandX, 11, true);
  let companyY = Math.max(brandEnd + 2, 35);
  if (datos.empresa.ruc) { text(`RUC ${datos.empresa.ruc}`, left, companyY, 7.2, true); companyY += leading; }
  if (datos.empresa.direccion) companyY = paragraph(datos.empresa.direccion, left, companyY, 119, 7.2);
  if (datos.empresa.telefono) { text(`TELÉFONO: ${datos.empresa.telefono}`, left, companyY, 7.2); companyY += leading; }
  if (datos.empresa.email) companyY = paragraph(datos.empresa.email, left, companyY, 119, 7.2);

  box(137, 12, 60, 31, blue);
  text(datos.empresa.ruc ? `RUC ${datos.empresa.ruc}` : "COMPROBANTE", 167, 18.5, 11.5, true, black, "center");
  text(datos.tipo === "Factura" ? "FACTURA" : "BOLETA DE VENTA", 167, 25, datos.tipo === "Factura" ? 14 : 11.5, true, black, "center");
  text("ELECTRÓNICA", 167, 31, 13.5, true, black, "center");
  text(referencia, 167, 38, 11, true, black, "center");
  y = Math.max(companyY + 2, 47);

  // Ambos recuadros crecen con los datos, sin alturas en blanco innecesarias.
  const clientTop = y;
  let clientY = y + 4.5;
  const clientRows = [
    ["CLIENTE", datos.cliente.nombre],
    [datos.cliente.tipoDocumento, datos.cliente.documento],
    ["DIRECCIÓN", datos.cliente.direccion],
    ["CORREO", datos.cliente.email],
  ];
  for (const [label, value] of clientRows) {
    if (!value) continue;
    text(label, left + 1.5, clientY, 7, true);
    text(":", 40, clientY, 7);
    clientY = paragraph(value, 43, clientY, 89, 7.2);
  }
  const clientHeight = Math.max(23, clientY - clientTop + 2);
  box(left, clientTop, 122, clientHeight);
  box(137, clientTop, 60, clientHeight);
  for (const [label, value, offset] of [
    ["FECHA EMISIÓN", date(datos.fecha), 0],
    ["VENCIMIENTO", date(datos.vencimiento), 4],
    ["MONEDA", datos.moneda === "PEN" ? "SOLES" : "DÓLARES", 8],
    ["FORMA DE PAGO", datos.pago, 12],
  ] as const) {
    text(label, 139, clientTop + 4.5 + offset, 6.8, true);
    text(value, 195, clientTop + 4.5 + offset, 7, false, black, "right");
  }
  y = clientTop + clientHeight + 2;

  function tableHeader() {
    box(left, y, width, 6.5, blue);
    text("CANT.", 20, y + 4.3, 7, true, black, "center");
    text("UM", 33, y + 4.3, 7, true, black, "center");
    text("ÍTEM", 45, y + 4.3, 7, true, black, "center");
    text("DESCRIPCIÓN", 53, y + 4.3, 7, true);
    text("P. UNIT.", 151, y + 4.3, 7, true, black, "right");
    text("DSCTO.", 171, y + 4.3, 7, true, black, "right");
    text("IMPORTE", 195, y + 4.3, 7, true, black, "right");
    y += 6.5;
  }
  const rowHeight = (descripcion: string) => Math.max(7.5, wrap(descripcion, 75, 7.5).length * leading + 3.5);
  ensure(6.5 + rowHeight(datos.lineas[0].descripcion)); tableHeader();
  datos.lineas.forEach((item, i) => {
    const height = rowHeight(item.descripcion);
    if (y + height > 274) { continuation(); tableHeader(); }
    if (i % 2) { pdf.setFillColor("#F2F2F2"); pdf.rect(left, y, width, height, "F"); }
    text(item.cantidad.toLocaleString("en-US", { maximumFractionDigits: 3 }), 20, y + 4, 7.2, false, black, "center");
    text(item.unidad, 33, y + 4, 6.8, false, black, "center");
    text(String(i + 1).padStart(2, "0"), 45, y + 4, 7.2, false, black, "center");
    paragraph(item.descripcion, 53, y + 4, 75, 7.5);
    text(money(item.precio), 151, y + 4, 7.2, false, black, "right");
    text(money(item.descuento), 171, y + 4, 7.2, false, black, "right");
    text(money(totales.lineas[i].neto), 195, y + 4, 7.5, false, black, "right");
    y += height; line(y);
  });

  y += 3;
  ensure(54);
  const totals = [["SUBTOTAL", totales.bruto], ["DESCUENTOS", -totales.descuentos], ["BASE IMPONIBLE", totales.base], [`IGV ${datos.igv}%`, totales.igv], ["TOTAL", totales.total]] as const;
  totals.forEach(([label, value], i) => {
    const isTotal = i === totals.length - 1;
    if (isTotal) {
      // Separa la regla del IGV y deja aire sobre la línea base del total.
      y += 1.5;
      line(y, 128, right);
      y += 5;
    }
    text(label, 158, y, isTotal ? 8 : 7.2, true, black, "right");
    text(currency, 170, y, 7.2, isTotal);
    text(money(value), right, y, isTotal ? 8.5 : 7.2, isTotal, black, "right");
    y += isTotal ? 6 : 4.2;
  });
  y += 2;
  const letters = wrap(`IMPORTE EN LETRAS: ${importeEnLetras(totales.total, datos.moneda)}`, width - 5, 7.2);
  const lettersHeight = letters.length * leading + 3;
  ensure(lettersHeight + 9); box(left, y, width, lettersHeight);
  letters.forEach((value, i) => text(value, left + 2, y + 3.5 + i * leading, 7.2));
  y += lettersHeight + 5;
  text("MEDIO DE PAGO:", left, y, 7.2, true);
  text(`${datos.pago}. Vencimiento: ${date(datos.vencimiento)}`, 39, y, 7.2);
  y += 4;
  if (datos.notas) {
    ensure(8); text("OBSERVACIONES:", left, y, 7.2, true); y += 3.5;
    wrap(datos.notas, width - 2, 7.2).forEach(value => {
      ensure(4); text(value, left, y, 7.2); y += leading;
    });
  }
  for (let page = 1; page <= pdf.getNumberOfPages(); page++) {
    pdf.setPage(page);
    text(referencia, left, 286, 6.5, false, gray);
    text(denominacion, 105, 286, 6.5, false, gray, "center");
    text(`Página ${page} de ${pdf.getNumberOfPages()}`, right, 286, 6.5, false, gray, "right");
  }
  return pdf.output("arraybuffer");
}
