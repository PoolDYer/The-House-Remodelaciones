# Facturación electrónica

Acceso: **Panel de administración → Facturación electrónica**, en `/dashboard/admin/facturacion`.

Permite preparar facturas y boletas internas con datos de empresa y cliente, moneda PEN/USD, fechas, forma de pago, conceptos, cantidades fraccionarias, descuentos por concepto e IGV configurable. Los precios se ingresan sin IGV; los descuentos son importes por línea. Los cálculos se redondean por concepto a céntimos, y después se calcula el IGV sobre la base descontada.

El documento PDF es A4, con texto seleccionable, logo local de The House, encabezados de tabla repetidos y páginas numeradas. El visor integrado permite ajustar el ancho, ampliar y cambiar de página, también en móvil. La vista previa y la descarga utilizan el mismo archivo. La vista previa de datos no guardados se identifica como POR ASIGNAR. Al guardar se asigna un correlativo de base de datos con formato F001-00000001 para facturas y B001-00000001 para boletas, con contadores independientes y asignación transaccional; no se reutilizan los números eliminados.

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

La tabla `FacturaPrueba` guarda el contenido validado como JSON y su correlativo. La tabla `SerieFactura` conserva el último correlativo por serie. Los documentos anteriores conservan su identificación. La implementación no modifica cotizaciones, productos ni cuentas administradoras.

```sh
node scripts/test-facturacion.cjs
```

Comprueba cálculos, redondeo, límites y datos inválidos, y genera un PDF de ejemplo en `output/pdf/factura.pdf` y otro con 65 conceptos en `tmp/pdfs/`.

Para la prueba de navegador, iniciar el servidor local y ejecutar `python scripts/test-facturacion-web.py` con Playwright, pypdf y Chromium instalados. Opcionalmente configurar `FACTURACION_TEST_URL` y `PLAYWRIGHT_CHROMIUM_EXECUTABLE`. Usa una sesión temporal del administrador configurado, comprueba la emisión concurrente de facturas y la serie de boletas, y elimina los comprobantes creados al terminar.

La serie tiene cuatro caracteres y comienza con F para facturas o B para boletas. El correlativo admite hasta ocho dígitos. El formato se basa en el [anexo de SUNAT](https://www.sunat.gob.pe/legislacion/superin/2022/anexo-123-2022.pdf) y la [descripción oficial de boletas](https://cpe.sunat.gob.pe/tipos_de_comprobantes/boleta). El formato de numeración no incorpora XML, firma ni validación tributaria. Al guardar se fija el tipo de documento; la edición conserva su serie y correlativo. Las eliminaciones no reutilizan números.
