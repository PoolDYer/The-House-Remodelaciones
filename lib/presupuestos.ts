/**
 * Calcula el subtotal de una línea: cantidad * precioUnitario - descuento
 */
export function calcularSubtotalLinea(
  cantidad: any,
  precioUnitario: any,
  descuento: any = 0
): number {
  const cant = Number(cantidad);
  const precio = Number(precioUnitario);
  const desc = Number(descuento);

  return cant * precio - desc;
}

/**
 * Calcula el subtotal total de todas las líneas
 */
export function calcularSubtotalPresupuesto(
  lineas: { subtotal: any }[]
): number {
  return lineas.reduce((acc, linea) => {
    return acc + Number(linea.subtotal);
  }, 0);
}

/**
 * Calcula el monto del IGV
 */
export function calcularIGV(
  subtotal: any,
  porcentaje: any
): number {
  const sub = Number(subtotal);
  const perc = Number(porcentaje);

  return (sub * perc) / 100;
}

/**
 * Calcula el total: subtotal + IGV - descuentoTotal
 */
export function calcularTotal(
  subtotal: any,
  igv: any = 0,
  descuentoTotal: any = 0
): number {
  const sub = Number(subtotal);
  const igvMonto = Number(igv);
  const desc = Number(descuentoTotal);

  return sub + igvMonto - desc;
}

/**
 * Genera un número de cotización/presupuesto secuencial
 * Formato: COT-YYYY-NNNNNN (Ej: COT-2026-000001)
 */
export async function generarNumeroPresupuesto(
  presupuestosCount: number
): Promise<string> {
  const año = new Date().getFullYear();
  const numero = (presupuestosCount + 1).toString().padStart(6, "0");
  return `COT-${año}-${numero}`;
}
