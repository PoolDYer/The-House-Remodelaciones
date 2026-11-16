// Ejecutar con: node scripts/test-facturacion.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  });
  module._compile(source.outputText, filename);
};
const { nuevaFactura, facturaSchema, calcularFactura, numeroFactura, serieFactura, importeEnLetras } = require('../lib/facturacion.ts');
const { generarFacturaPDF } = require('../lib/factura-pdf.ts');
const example = {
  ...nuevaFactura(),
  empresa: { nombre: 'The House Remodelaciones', ruc: '20000000001', direccion: 'Av. Ramón Castilla 598, Lima, Perú', telefono: '(01) 555-0100', email: 'contacto@example.com' },
  cliente: { nombre: 'Comercial Los Jardines S.A.C.', tipoDocumento: 'RUC', documento: '20000000002', direccion: 'Av. Los Jardines 456, Miraflores, Lima', email: 'cliente@example.com' },
  lineas: [
    { descripcion: 'Fabricación e instalación de mueble de cocina en melamina de 18 mm, acabado roble natural, herrajes de cierre suave y tiradores de aluminio.', cantidad: 1, unidad: 'Servicio', precio: 2500, descuento: 100 },
    { descripcion: 'Tablero de melamina acabado roble natural', cantidad: 2, unidad: 'Unidad', precio: 180, descuento: 0 },
    { descripcion: 'Revestimiento decorativo para pared, incluye instalación y acabado final.', cantidad: 3.5, unidad: 'm²', precio: 85.50, descuento: 0 },
  ],
  notas: 'Pago por transferencia bancaria.\nPlazo de entrega: 10 días hábiles. Instalación y acabados incluidos según las condiciones acordadas.',
};
assert.equal(facturaSchema.safeParse(example).success, true);
assert.equal(serieFactura('Factura'), 'F001');
assert.equal(serieFactura('Boleta'), 'B001');
assert.equal(numeroFactura(22, 'F001', 1), 'F001-00000001');
assert.equal(numeroFactura(23, 'B001', 99999999), 'B001-99999999');
assert.equal(numeroFactura(22), '001-000022', 'Se conserva la numeración anterior');
assert.equal(importeEnLetras(3609.92, 'PEN'), 'TRES MIL SEISCIENTOS NUEVE CON 92/100 SOLES');
assert.equal(importeEnLetras(0, 'PEN'), 'CERO CON 00/100 SOLES');
assert.equal(importeEnLetras(21.01, 'USD'), 'VEINTIÚN CON 01/100 DÓLARES AMERICANOS');
assert.equal(importeEnLetras(1000000, 'PEN'), 'UN MILLÓN CON 00/100 SOLES');
assert.equal(importeEnLetras(21001.99, 'PEN'), 'VEINTIÚN MIL UN CON 99/100 SOLES');
assert.deepEqual(calcularFactura(example), {
  lineas: [{ bruto: 2500, descuento: 100, neto: 2400 }, { bruto: 360, descuento: 0, neto: 360 }, { bruto: 299.25, descuento: 0, neto: 299.25 }],
  bruto: 3159.25, descuentos: 100, base: 3059.25, igv: 550.67, total: 3609.92,
});
const fractional = { ...example, igv: 0, lineas: [{ ...example.lineas[0], cantidad: 0.125, precio: 0.12, descuento: 0 }] };
assert.equal(calcularFactura(fractional).total, 0.02, 'Redondeo de medio céntimo');
assert.equal(calcularFactura({ ...example, igv: 0 }).total, 3059.25);
assert.equal(facturaSchema.safeParse({ ...example, lineas: [{ ...example.lineas[0], descuento: 2501 }] }).success, false);
assert.equal(facturaSchema.safeParse({ ...example, lineas: [] }).success, false);
assert.equal(facturaSchema.safeParse({ ...example, fecha: '2026-02-30' }).success, false);
assert.equal(facturaSchema.safeParse({ ...example, vencimiento: '2020-01-01' }).success, false);
assert.equal(facturaSchema.safeParse({ ...example, cliente: { ...example.cliente, documento: '123' } }).success, false);
assert.equal(facturaSchema.safeParse({ ...example, lineas: [{ ...example.lineas[0], precio: Infinity }] }).success, false);
assert.equal(facturaSchema.safeParse({ ...example, lineas: [{ ...example.lineas[0], cantidad: -1 }] }).success, false);
assert.equal(facturaSchema.safeParse({ ...example, lineas: [{ ...example.lineas[0], precio: 0.001 }] }).success, false);
for (const field of ['precio', 'cantidad', 'descuento']) {
  assert.equal(facturaSchema.safeParse({ ...example, lineas: [{ ...example.lineas[0], [field]: 1e308 }] }).success, false);
}
assert.equal(facturaSchema.safeParse({ ...example, igv: 1e308 }).success, false);
assert.equal(facturaSchema.safeParse({ ...example, lineas: Array.from({ length: 100 }, () => ({ ...example.lineas[0], cantidad: 10000, precio: 1000000 })) }).success, false);
fs.mkdirSync('output/pdf', { recursive: true }); fs.mkdirSync('tmp/pdfs', { recursive: true });
fs.writeFileSync('output/pdf/factura.pdf', Buffer.from(generarFacturaPDF(example, 1, 'F001', 1)));
fs.writeFileSync('tmp/pdfs/boleta.pdf', Buffer.from(generarFacturaPDF({ ...example, tipo: 'Boleta' }, 2, 'B001', 1)));
const long = { ...example, moneda: 'USD', notas: 'Observación extensa para verificar los saltos de página. '.repeat(20), lineas: Array.from({ length: 65 }, (_, i) => ({ ...example.lineas[i % 3], descripcion: `Concepto ${i + 1}: ${'Instalación de módulos, herrajes y acabados de melamina. '.repeat(6)}` })) };
assert.equal(facturaSchema.safeParse(long).success, true);
fs.writeFileSync('tmp/pdfs/factura-multipagina.pdf', Buffer.from(generarFacturaPDF(long, 3, 'F001', 2)));
fs.writeFileSync('tmp/pdfs/ejemplo.json', JSON.stringify(example));
console.log('Validaciones y cálculos correctos. PDFs de ejemplo y multipágina generados.');
