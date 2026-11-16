import { z } from "zod";

const texto = (max: number) => z.string().trim().max(max);
const dinero = z.number().finite().min(0).max(1000000).multipleOf(0.01);
const fecha = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida").refine(v => {
  const date = new Date(`${v}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === v;
}, "Fecha inválida");

export const facturaSchema = z.object({
  tipo: z.enum(["Factura", "Boleta"]),
  moneda: z.enum(["PEN", "USD"]),
  fecha,
  vencimiento: fecha,
  empresa: z.object({
    nombre: texto(120).min(2, "Ingresa el nombre de la empresa"),
    ruc: texto(11).refine(v => !v || /^\d{11}$/.test(v), "El RUC debe tener 11 dígitos"),
    direccion: texto(200), telefono: texto(40),
    email: texto(120).refine(v => !v || z.email().safeParse(v).success, "Correo de empresa inválido"),
  }),
  cliente: z.object({
    nombre: texto(160).min(2, "Ingresa el nombre del cliente"),
    tipoDocumento: z.enum(["RUC", "DNI", "Otro"]),
    documento: texto(30).min(1, "Ingresa el documento del cliente"),
    direccion: texto(200),
    email: texto(120).refine(v => !v || z.email().safeParse(v).success, "Correo del cliente inválido"),
  }),
  pago: z.enum(["Transferencia", "Efectivo", "Tarjeta", "Crédito"]),
  igv: z.number().finite().min(0).max(100).multipleOf(0.01),
  notas: texto(1200),
  lineas: z.array(z.object({
    descripcion: texto(500).min(1, "Describe cada producto o servicio"),
    unidad: z.enum(["Unidad", "Servicio", "m²", "Metro", "Hora"]),
    cantidad: z.number().finite().min(0.001).max(10000).multipleOf(0.001),
    precio: dinero,
    descuento: dinero,
  })).min(1, "Agrega al menos un concepto").max(100, "Máximo 100 conceptos"),
}).superRefine((data, ctx) => {
  if (data.vencimiento < data.fecha) ctx.addIssue({ code: "custom", path: ["vencimiento"], message: "El vencimiento no puede ser anterior a la emisión" });
  if (data.cliente.tipoDocumento === "RUC" && !/^\d{11}$/.test(data.cliente.documento)) ctx.addIssue({ code: "custom", path: ["cliente", "documento"], message: "El RUC del cliente debe tener 11 dígitos" });
  if (data.cliente.tipoDocumento === "DNI" && !/^\d{8}$/.test(data.cliente.documento)) ctx.addIssue({ code: "custom", path: ["cliente", "documento"], message: "El DNI debe tener 8 dígitos" });
  data.lineas.forEach((l, i) => {
    if (Math.round(l.descuento * 100) > importeLinea(l)) ctx.addIssue({ code: "custom", path: ["lineas", i, "descuento"], message: `El descuento del concepto ${i + 1} supera su importe` });
  });
  if (calcularFactura(data).total > 999999999.99) ctx.addIssue({ code: "custom", message: "El total supera el máximo de 999,999,999.99" });
});

export type FacturaDatos = z.infer<typeof facturaSchema>;
export type FacturaGuardada = { id: string; numero: number; datos: FacturaDatos; createdAt: string; updatedAt: string };

// Cantidad en milésimas y precio en céntimos: redondeo por concepto, sin acumular flotantes.
function importeLinea(l: FacturaDatos["lineas"][number]) {
  // El formulario también calcula mientras el usuario escribe valores aún inválidos.
  if (!Number.isFinite(l.cantidad) || !Number.isFinite(l.precio) || l.cantidad < 0 || l.cantidad > 10000 || l.precio < 0 || l.precio > 1000000) return 0;
  return Number((BigInt(Math.round(l.cantidad * 1000)) * BigInt(Math.round(l.precio * 100)) + 500n) / 1000n);
}
export function calcularFactura(data: Pick<FacturaDatos, "lineas" | "igv">) {
  const lineas = data.lineas.map(l => {
    const bruto = importeLinea(l);
    const descuento = Number.isFinite(l.descuento) && l.descuento >= 0 && l.descuento <= 1000000 ? Math.round(l.descuento * 100) : 0;
    return { bruto: bruto / 100, descuento: descuento / 100, neto: (bruto - descuento) / 100 };
  });
  const bruto = lineas.reduce((s, l) => s + Math.round(l.bruto * 100), 0);
  const descuentos = lineas.reduce((s, l) => s + Math.round(l.descuento * 100), 0);
  const base = bruto - descuentos;
  const tasa = Number.isFinite(data.igv) && data.igv >= 0 && data.igv <= 100 ? Math.round(data.igv * 100) : 0;
  const igv = Number((BigInt(base) * BigInt(tasa) + 5000n) / 10000n);
  return { lineas, bruto: bruto / 100, descuentos: descuentos / 100, base: base / 100, igv: igv / 100, total: (base + igv) / 100 };
}
export const numeroFactura = (numero?: number) => numero ? `001-${String(numero).padStart(6, "0")}` : "POR ASIGNAR";
export const formatoDinero = (value: number, moneda: string) => new Intl.NumberFormat("es-PE", { style: "currency", currency: moneda }).format(value);
export function nuevaFactura(): FacturaDatos {
  const fecha = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return {
    tipo: "Factura", moneda: "PEN", fecha, vencimiento: fecha,
    empresa: { nombre: "The House Remodelaciones", ruc: "", direccion: "", telefono: "", email: "" },
    cliente: { nombre: "", tipoDocumento: "RUC", documento: "", direccion: "", email: "" },
    pago: "Transferencia", igv: 18, notas: "Gracias por confiar en The House Remodelaciones.",
    lineas: [{ descripcion: "", unidad: "Unidad", cantidad: 1, precio: 0, descuento: 0 }],
  };
}
