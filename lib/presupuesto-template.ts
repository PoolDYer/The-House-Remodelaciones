import { Presupuesto, LineaPresupuesto, ConfiguracionEmpresa } from "@prisma/client";

export function generatePresupuestoHTML(
  presupuesto: Presupuesto & { lineas: LineaPresupuesto[] },
  empresa: ConfiguracionEmpresa | null
): string {
  const subtotal = parseFloat(presupuesto.subtotal.toString());
  const igvMonto = parseFloat(presupuesto.igvMonto.toString());
  const descuentoTotal = parseFloat(presupuesto.descuentoTotal.toString());
  const total = parseFloat(presupuesto.total.toString());
  const igvPorcentaje = parseFloat(presupuesto.igvPorcentaje.toString());

  const empresaData = empresa || {
    nombreEmpresa: "The House Remodelaciones",
    ruc: "20XXXXXXXXX",
    direccion: "Dirección de la empresa",
    telefono: "(+51) XXX XXX XXX",
    email: "",
    website: "",
    logo: null,
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Arial', sans-serif; color: #333; background: white; }
          .page { width: 210mm; height: 297mm; padding: 15mm; display: block; }
          
          /* HEADER */
          .header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
          .logo-section { display: flex; align-items: center; gap: 15px; }
          .logo { width: 70px; height: 70px; background: #f0f0f0; border: 2px solid #333; display: flex; align-items: center; justify-content: center; }
          .logo img { width: 95%; height: 95%; object-fit: contain; }
          
          .empresa-section { font-size: 11px; line-height: 1.4; flex: 1; }
          .empresa-section strong { font-size: 13px; display: block; margin-bottom: 2px; }
          
          .numero-documento { 
            border: 2px solid #333; 
            padding: 8px 12px; 
            text-align: center; 
            background: #f9f9f9; 
          }
          .numero-documento .label { font-size: 9px; }
          .numero-documento .numero { font-size: 13px; font-weight: bold; }
          
          /* SEPARADOR */
          .separator { border-top: 2px solid #333; margin: 10px 0; }
          
          /* DATOS CLIENTE */
          .client-info { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 8px; }
          .client-row { display: contents; }
          .client-row > span { display: inline-block; margin-right: 40px; line-height: 1.5; }
          
          /* TABLA */
          .items-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 10px 0; 
            font-size: 10px; 
          }
          
          .items-table th { 
            background: #f0f0f0; 
            border: 1px solid #999; 
            padding: 6px; 
            text-align: left; 
            font-weight: bold; 
            font-size: 9px; 
          }
          
          .items-table td { 
            border: 1px solid #999; 
            padding: 6px; 
            text-align: left; 
          }
          
          .items-table .numero { text-align: center; width: 5%; }
          .items-table .unidad { width: 10%; }
          .items-table .descripcion { width: 30%; }
          .items-table .marca { width: 15%; text-align: center; }
          .items-table .lote { width: 10%; text-align: center; }
          .items-table .precio { text-align: right; width: 12%; }
          .items-table .descuento { text-align: right; width: 10%; }
          .items-table .total { text-align: right; width: 12%; font-weight: bold; }
          
          /* TOTALES */
          .totals-section { margin-top: 10px; }
          .totals-table { width: 100%; border-collapse: collapse; font-size: 11px; }
          .totals-table td { padding: 4px 8px; }
          .totals-table .label { text-align: right; width: 70%; }
          .totals-table .amount { width: 30%; text-align: right; border-bottom: 1px solid #999; font-weight: bold; }
          .totals-table .total-row .label { font-weight: bold; border-top: 2px solid #000; border-bottom: 2px solid #000; font-size: 12px; }
          .totals-table .total-row .amount { border-top: 2px solid #000; border-bottom: 2px solid #000; font-size: 12px; }
          
          /* PAGOS */
          .pagos-section { margin-top: 10px; display: flex; gap: 30px; font-size: 10px; }
          .pago-item { flex: 1; }
          .pago-item strong { display: block; margin-bottom: 3px; }
          
          /* FOOTER */
          .footer { margin-top: 15px; font-size: 9px; color: #666; border-top: 1px solid #999; padding-top: 8px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="page">
          
          <!-- HEADER -->
          <div class="header-top">
            <div class="logo-section">
              <div class="logo">
                <img src="/logo.svg" alt="Logo">
              </div>
              <div class="empresa-section">
                <strong>${empresaData.nombreEmpresa}</strong>
                <div>RUC ${empresaData.ruc || "-"}</div>
                <div>${empresaData.direccion || ""}</div>
                <div>${empresaData.telefono ? `Teléfono: ${empresaData.telefono}` : ""}</div>
                <div>${empresaData.email ? `Email: ${empresaData.email}` : ""}</div>
              </div>
            </div>
            <div class="numero-documento">
              <div class="label">COTIZACIÓN</div>
              <div class="numero">${presupuesto.numero}</div>
            </div>
          </div>
          
          <div class="separator"></div>
          
          <!-- DATOS CLIENTE -->
          <div class="client-info">
            <span><strong>Cliente:</strong> ${presupuesto.clienteNombre || "Por definir"}</span>
            <span><strong>RUC:</strong> ${presupuesto.clienteRuc || "-"}</span>
          </div>
          <div class="client-info">
            <span><strong>Dirección:</strong> ${presupuesto.clienteDireccion || "-"}</span>
            <span><strong>T. Pago:</strong> Transferencia</span>
          </div>
          <div class="client-info">
            <span><strong>Teléfono:</strong> ${presupuesto.clienteTelefono || "-"}</span>
            <span><strong>Vendedor:</strong> ${empresaData.nombreEmpresa}</span>
          </div>
          
          <div class="separator"></div>
          
          <!-- TABLA DE ITEMS -->
          <table class="items-table">
            <thead>
              <tr>
                <th class="numero">CANT.</th>
                <th class="unidad">UNIDAD</th>
                <th class="descripcion">DESCRIPCIÓN</th>
                <th class="marca">MARCA MODELO</th>
                <th class="lote">LOTE</th>
                <th class="precio">P.UNIT.</th>
                <th class="descuento">DTO.</th>
                <th class="total">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${presupuesto.lineas.map((linea) => {
                const cantNum = parseFloat(linea.cantidad.toString());
                const precioNum = parseFloat(linea.precioUnitario.toString());
                const descuentoNum = parseFloat(linea.descuento.toString());
                const subtotalNum = parseFloat(linea.subtotal.toString());
                
                return `
                  <tr>
                    <td class="numero">${cantNum.toFixed(2)}</td>
                    <td class="unidad">NIU</td>
                    <td class="descripcion">${linea.descripcion}</td>
                    <td class="marca">-</td>
                    <td class="lote">-</td>
                    <td class="precio">S/ ${precioNum.toFixed(2)}</td>
                    <td class="descuento">S/ ${descuentoNum.toFixed(2)}</td>
                    <td class="total">S/ ${subtotalNum.toFixed(2)}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
          
          <!-- TOTALES -->
          <div class="totals-section">
            <table class="totals-table">
              <tr>
                <td class="label">OP. GRAVADAS:</td>
                <td class="amount">S/ ${subtotal.toFixed(2)}</td>
              </tr>
              ${igvMonto > 0 ? `
                <tr>
                  <td class="label">IGV (${igvPorcentaje.toFixed(1)}%):</td>
                  <td class="amount">S/ ${igvMonto.toFixed(2)}</td>
                </tr>
              ` : ""}
              <tr class="total-row">
                <td class="label">TOTAL A PAGAR:</td>
                <td class="amount">S/ ${total.toFixed(2)}</td>
              </tr>
            </table>
          </div>
          
          <!-- PAGOS Y SALDO -->
          <div class="pagos-section">
            <div class="pago-item">
              <strong>PAGOS:</strong>
              <div>S/ 0.00</div>
            </div>
            <div class="pago-item">
              <strong>SALDO:</strong>
              <div>S/ ${total.toFixed(2)}</div>
            </div>
          </div>
          
          <!-- NOTAS -->
          ${presupuesto.notas ? `
            <div style="margin-top: 10px; padding: 8px; background: #fff3cd; font-size: 9px; border-left: 3px solid #ffc107;">
              <strong>Notas:</strong> ${presupuesto.notas}
            </div>
          ` : ""}
          
          <!-- FOOTER -->
          <div class="footer">
            <p>Gracias por su confianza. Este presupuesto es válido por 30 días a partir de la fecha de emisión.</p>
          </div>
          
        </div>
      </body>
    </html>
  `;
}
