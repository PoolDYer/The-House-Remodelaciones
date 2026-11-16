# Facturación

Acceso: **Panel de administración → Facturación**, en `/dashboard/admin/facturacion`.

Permite preparar facturas y boletas internas con datos de empresa y cliente, moneda PEN/USD, fechas, forma de pago, conceptos, cantidades fraccionarias, descuentos por concepto e IGV configurable. Los precios se ingresan sin IGV; los descuentos son importes por línea. Los cálculos se redondean por concepto a céntimos, y después se calcula el IGV sobre la base descontada.

El documento PDF es A4, con texto seleccionable, logo local de The House, encabezados de tabla repetidos y páginas numeradas. El visor integrado permite ajustar el ancho, ampliar y cambiar de página, también en móvil. La vista previa y la descarga utilizan el mismo archivo. La vista previa de datos no guardados se identifica como POR ASIGNAR. Al guardar se asigna un correlativo de base de datos con formato 001-000001; no se reutilizan los números eliminados.

Los comprobantes conservan una copia de los datos ingresados, independiente de los cambios posteriores en Configuración. Se pueden editar, buscar, volver a descargar y eliminar desde el historial. Cada administrador accede solamente a sus propios comprobantes. Los endpoints requieren un token válido y una cuenta administradora existente. No se incluyen tokens en las URLs del PDF.

No genera XML, firma digital, CDR ni comunicación con SUNAT. El porcentaje de IGV es un valor de prueba, sin determinar tratamientos tributarios reales.

## Instalación y verificación

El proyecto utiliza sincronización de esquema Prisma. Con `DATABASE_URL` configurada para el entorno que se va a utilizar:

```sh
npx prisma db push
npx prisma generate
npm run build
npm run start
```

La nueva tabla `FacturaPrueba` guarda el contenido validado como JSON y su correlativo. Su creación no modifica cotizaciones, productos ni cuentas administradoras.

```sh
node scripts/test-facturacion.cjs
```

Comprueba cálculos, redondeo, límites y datos inválidos, y genera un PDF de ejemplo en `output/pdf/factura.pdf` y otro con 65 conceptos en `tmp/pdfs/`.

Para la prueba de navegador, iniciar el servidor local y ejecutar `python scripts/test-facturacion-web.py` con Playwright, pypdf y Chromium instalados. Opcionalmente configurar `FACTURACION_TEST_URL` y `PLAYWRIGHT_CHROMIUM_EXECUTABLE`. Usa una sesión temporal del administrador configurado, crea un único comprobante de prueba y lo elimina al terminar.
