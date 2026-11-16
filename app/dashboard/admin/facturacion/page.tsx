"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Download, Eye, FilePlus2, Plus, Save, Search, Trash2, X } from "lucide-react";
import { calcularFactura, facturaSchema, formatoDinero, nuevaFactura, numeroFactura, serieFactura, nombreComprobante, type FacturaDatos, type FacturaGuardada } from "@/lib/facturacion";
import styles from "./facturacion.module.css";
import { FacturaPDFViewer } from "@/components/dashboard/FacturaPDFViewer";

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return <label className={styles.field}><span>{label}</span>{children}</label>;
}

export default function FacturacionPage() {
  const [datos, setDatos] = useState<FacturaDatos>(nuevaFactura);
  const [facturas, setFacturas] = useState<FacturaGuardada[]>([]);
  const [actual, setActual] = useState<FacturaGuardada | null>(null);
  const [empresa, setEmpresa] = useState<FacturaDatos["empresa"]>(nuevaFactura().empresa);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfNombre, setPdfNombre] = useState("comprobante-borrador");
  const editor = useRef<HTMLDivElement>(null);
  const totales = calcularFactura(datos);
  const money = (value: number) => formatoDinero(value, datos.moneda);

  async function api(url: string, options: RequestInit = {}) {
    const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`, ...options.headers }, cache: "no-store" });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message || "No se pudo completar la operación. Inténtalo de nuevo.");
    }
    return response;
  }
  async function cargarHistorial() {
    const response = await api("/api/facturacion");
    setFacturas(await response.json());
  }
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [list, config] = await Promise.all([api("/api/facturacion"), api("/api/configuracion")]);
        const [items, configBody] = await Promise.all([list.json(), config.json()]);
        if (!active) return;
        setFacturas(items);
        const c = configBody.configuracion ?? configBody;
        const e = { nombre: c.nombreEmpresa || "The House Remodelaciones", ruc: c.ruc || "", direccion: c.direccion || "", telefono: c.telefono || "", email: c.email || "" };
        setEmpresa(e); setDatos(d => ({ ...d, empresa: e }));
      } catch (err) { if (active) setError((err as Error).message); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
    // La carga inicial no debe volver a ejecutarse al editar el formulario.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); }, [pdfUrl]);

  function editar(next: FacturaDatos) {
    setDatos(next); setDirty(true); setPdfUrl(null); setError(""); setNotice("");
  }
  function cambiar<K extends keyof FacturaDatos>(key: K, value: FacturaDatos[K]) { editar({ ...datos, [key]: value }); }
  function cambiarLinea(index: number, key: string, value: string | number) {
    cambiar("lineas", datos.lineas.map((l, i) => i === index ? { ...l, [key]: value } : l));
  }
  function validar() {
    const result = facturaSchema.safeParse(datos);
    if (!result.success) { setError(result.error.issues[0].message); return null; }
    return result.data;
  }
  async function mostrarPDF(factura?: FacturaGuardada, draft?: FacturaDatos) {
    const response = factura
      ? await api(`/api/facturacion/${factura.id}/pdf`)
      : await api("/api/facturacion/preview", { method: "POST", body: JSON.stringify(draft) });
    const blob = await response.blob();
    setPdfUrl(URL.createObjectURL(blob));
    setPdfNombre(factura ? numeroFactura(factura.numero, factura.serie, factura.correlativo) : "comprobante-borrador");
  }
  async function vistaPrevia() {
    const valid = validar(); if (!valid) return;
    setBusy("Generando PDF"); setError(""); setPdfUrl(null);
    try { await mostrarPDF(actual && !dirty ? actual : undefined, valid); }
    catch (err) { setError((err as Error).message); }
    finally { setBusy(""); }
  }
  async function guardar() {
    const valid = validar(); if (!valid) return;
    setBusy("Guardando comprobante"); setError(""); setNotice(""); setPdfUrl(null);
    try {
      const response = await api(actual ? `/api/facturacion/${actual.id}` : "/api/facturacion", { method: actual ? "PUT" : "POST", body: JSON.stringify(valid) });
      const saved: FacturaGuardada = await response.json();
      setActual(saved); setDatos(saved.datos); setDirty(false);
      setNotice(`${numeroFactura(saved.numero, saved.serie, saved.correlativo)} guardado. Ya puedes descargar el PDF.`);
      await cargarHistorial(); await mostrarPDF(saved);
    } catch (err) { setError((err as Error).message); }
    finally { setBusy(""); }
  }
  function puedeSalir() { return !dirty || window.confirm("Hay cambios sin guardar. ¿Quieres descartarlos?"); }
  function nuevo() {
    if (!puedeSalir()) return;
    const next = { ...nuevaFactura(), empresa };
    setDatos(next); setActual(null); setDirty(false); setPdfUrl(null); setError(""); setNotice("");
    editor.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  async function abrir(factura: FacturaGuardada) {
    if (!puedeSalir()) return;
    setActual(factura); setDatos(factura.datos); setDirty(false); setPdfUrl(null); setError(""); setNotice(""); setBusy("Abriendo comprobante");
    editor.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    try { await mostrarPDF(factura); } catch (err) { setError((err as Error).message); } finally { setBusy(""); }
  }
  async function eliminar(factura: FacturaGuardada) {
    if (!window.confirm(`¿Eliminar el comprobante ${numeroFactura(factura.numero, factura.serie, factura.correlativo)}?`)) return;
    if (actual?.id === factura.id && !puedeSalir()) return;
    setBusy("Eliminando comprobante"); setError("");
    try {
      await api(`/api/facturacion/${factura.id}`, { method: "DELETE" });
      if (actual?.id === factura.id) { setActual(null); setDatos({ ...nuevaFactura(), empresa }); setPdfUrl(null); setDirty(false); }
      await cargarHistorial(); setNotice("Comprobante eliminado.");
    } catch (err) { setError((err as Error).message); } finally { setBusy(""); }
  }
  const filtradas = facturas.filter(f => `${numeroFactura(f.numero, f.serie, f.correlativo)} ${f.datos.cliente.nombre} ${f.datos.cliente.documento}`.toLowerCase().includes(busqueda.toLowerCase()));

  return <div className={styles.module}>
    <header className={styles.heading}>
      <div><div className={styles.titleLine}><h1>Facturación electrónica</h1><span className={styles.badge}>Comprobantes</span></div><p>Emisión y administración de comprobantes en formato PDF.</p></div>
      <button className={styles.primary} disabled={!!busy || loading} onClick={() => nuevo()}><FilePlus2 size={18} />Nuevo comprobante</button>
    </header>
    {error && <div className={styles.error} role="alert">{error}<button aria-label="Cerrar error" onClick={() => setError("")}><X size={16} /></button></div>}
    {notice && <div className={styles.notice} role="status">{notice}</div>}
    {loading ? <p role="status">Cargando facturación…</p> : <>
      <div className={styles.workspace} ref={editor}>
        <form className={styles.editor} onSubmit={e => { e.preventDefault(); void guardar(); }}>
          <div className={styles.editorHead}><div><h2>{actual ? numeroFactura(actual.numero, actual.serie, actual.correlativo) : "Nuevo comprobante"}</h2><p>{dirty ? "Cambios sin guardar" : actual ? "Comprobante guardado" : "Completa los datos para comenzar"}</p></div></div>
          <fieldset disabled={!!busy}>
            <section className={styles.section}><h3>Datos del comprobante</h3><div className={styles.grid3}>
              <Campo label="Tipo de comprobante"><select aria-label="Tipo de comprobante" disabled={!!actual} value={datos.tipo} onChange={e => cambiar("tipo", e.target.value as FacturaDatos["tipo"])}><option value="Factura">Factura electrónica</option><option value="Boleta">Boleta de venta electrónica</option></select></Campo>
              <Campo label="Serie"><input readOnly value={actual ? actual.serie || "001" : serieFactura(datos.tipo)} /></Campo>
              <Campo label="Número correlativo"><input readOnly value={actual ? String(actual.correlativo ?? actual.numero).padStart(actual.serie ? 8 : 6, "0") : "Automático al guardar"} /></Campo>
              <Campo label="Moneda"><select value={datos.moneda} onChange={e => cambiar("moneda", e.target.value as FacturaDatos["moneda"])}><option value="PEN">Soles (S/)</option><option value="USD">Dólares (US$)</option></select></Campo>
              <Campo label="Forma de pago"><select value={datos.pago} onChange={e => cambiar("pago", e.target.value as FacturaDatos["pago"])}>{["Transferencia", "Efectivo", "Tarjeta", "Crédito"].map(v => <option key={v}>{v}</option>)}</select></Campo>
              <Campo label="Fecha de emisión"><input type="date" required value={datos.fecha} onChange={e => cambiar("fecha", e.target.value)} /></Campo>
              <Campo label="Vencimiento"><input type="date" required min={datos.fecha} value={datos.vencimiento} onChange={e => cambiar("vencimiento", e.target.value)} /></Campo>
              <Campo label="IGV (%)"><input type="number" min="0" max="100" step="0.01" required value={datos.igv} onChange={e => cambiar("igv", Number(e.target.value))} /></Campo>
            </div></section>
            <section className={styles.section}><h3>Empresa emisora</h3><div className={styles.grid2}>
              <Campo label="Nombre o razón social *"><input required maxLength={120} value={datos.empresa.nombre} onChange={e => cambiar("empresa", { ...datos.empresa, nombre: e.target.value })} /></Campo>
              <Campo label="RUC"><input inputMode="numeric" maxLength={11} value={datos.empresa.ruc} onChange={e => cambiar("empresa", { ...datos.empresa, ruc: e.target.value })} /></Campo>
              <Campo label="Dirección"><input maxLength={200} value={datos.empresa.direccion} onChange={e => cambiar("empresa", { ...datos.empresa, direccion: e.target.value })} /></Campo>
              <Campo label="Teléfono"><input type="tel" maxLength={40} value={datos.empresa.telefono} onChange={e => cambiar("empresa", { ...datos.empresa, telefono: e.target.value })} /></Campo>
              <Campo label="Correo de la empresa"><input type="email" maxLength={120} value={datos.empresa.email} onChange={e => cambiar("empresa", { ...datos.empresa, email: e.target.value })} /></Campo>
            </div></section>
            <section className={styles.section}><h3>Cliente</h3><div className={styles.grid2}>
              <Campo label="Nombre o razón social del cliente *"><input required maxLength={160} placeholder="¿A quién va dirigido?" value={datos.cliente.nombre} onChange={e => cambiar("cliente", { ...datos.cliente, nombre: e.target.value })} /></Campo>
              <div className={styles.documento}><Campo label="Tipo de documento"><select value={datos.cliente.tipoDocumento} onChange={e => cambiar("cliente", { ...datos.cliente, tipoDocumento: e.target.value as FacturaDatos["cliente"]["tipoDocumento"] })}><option>RUC</option><option>DNI</option><option>Otro</option></select></Campo><Campo label="Número de documento *"><input required maxLength={30} value={datos.cliente.documento} onChange={e => cambiar("cliente", { ...datos.cliente, documento: e.target.value })} /></Campo></div>
              <Campo label="Dirección del cliente"><input maxLength={200} value={datos.cliente.direccion} onChange={e => cambiar("cliente", { ...datos.cliente, direccion: e.target.value })} /></Campo>
              <Campo label="Correo del cliente"><input type="email" maxLength={120} value={datos.cliente.email} onChange={e => cambiar("cliente", { ...datos.cliente, email: e.target.value })} /></Campo>
            </div></section>
            <section className={styles.section}><div className={styles.sectionTitle}><h3>Productos y servicios</h3><span>Precios sin IGV</span></div>
              <div className={styles.lineas}>{datos.lineas.map((l, i) => <div className={styles.linea} key={i}>
                <div className={styles.lineaTitle}><strong>Ítem {String(i + 1).padStart(2, "0")}</strong><button type="button" className={styles.deleteButton} disabled={datos.lineas.length === 1} onClick={() => cambiar("lineas", datos.lineas.filter((_, j) => j !== i))} aria-label={`Eliminar concepto ${i + 1}`}><Trash2 size={16} /></button></div>
                <Campo label="Descripción del bien o servicio *"><textarea aria-label={`Descripción ${i + 1} *`} required maxLength={500} rows={2} placeholder="Detalle del producto o servicio" value={l.descripcion} onChange={e => cambiarLinea(i, "descripcion", e.target.value)} /></Campo>
                <div className={styles.lineNumbers}>
                  <Campo label="Cantidad"><input aria-label={`Cantidad ${i + 1}`} type="number" required min="0.001" max="10000" step="0.001" value={l.cantidad} onChange={e => cambiarLinea(i, "cantidad", Number(e.target.value))} /></Campo>
                  <Campo label="Unidad"><select aria-label={`Unidad ${i + 1}`} value={l.unidad} onChange={e => cambiarLinea(i, "unidad", e.target.value)}>{["Unidad", "Servicio", "m²", "Metro", "Hora"].map(v => <option key={v}>{v}</option>)}</select></Campo>
                  <Campo label="Precio unitario"><input aria-label={`Precio unitario ${i + 1}`} type="number" required min="0" max="1000000" step="0.01" value={l.precio} onChange={e => cambiarLinea(i, "precio", Number(e.target.value))} /></Campo>
                  <Campo label="Descuento"><input aria-label={`Descuento ${i + 1}`} type="number" required min="0" max="1000000" step="0.01" value={l.descuento} onChange={e => cambiarLinea(i, "descuento", Number(e.target.value))} /></Campo>
                </div><div className={styles.lineaTotal}>Importe sin IGV <strong>{money(totales.lineas[i].neto)}</strong></div>
              </div>)}</div>
              <button className={styles.secondary} type="button" disabled={datos.lineas.length >= 100} onClick={() => cambiar("lineas", [...datos.lineas, { descripcion: "", unidad: "Unidad", cantidad: 1, precio: 0, descuento: 0 }])}><Plus size={16} />Agregar concepto</button>
            </section>
            <section className={styles.section}><Campo label="Observaciones y condiciones"><textarea maxLength={1200} rows={3} value={datos.notas} onChange={e => cambiar("notas", e.target.value)} /></Campo></section>
          </fieldset>
          <div className={styles.actions}><button type="button" className={styles.secondary} disabled={!!busy} onClick={() => void vistaPrevia()}><Eye size={17} />Vista previa PDF</button><button type="submit" className={styles.primary} disabled={!!busy || (!!actual && !dirty)}><Save size={17} />{actual ? "Guardar cambios" : "Guardar comprobante"}</button></div>
        </form>
        <aside className={styles.previewColumn}>
          <div className={styles.preview}><div className={styles.previewHead}><div><h2>Documento PDF</h2><span>{pdfUrl ? `${pdfNombre} · A4` : "Vista previa del documento"}</span></div>{pdfUrl && <a className={styles.download} href={pdfUrl} download={`${pdfNombre}.pdf`}><Download size={17} />Descargar</a>}</div>
            {pdfUrl ? <><FacturaPDFViewer url={pdfUrl} /><a className={styles.openPdf} href={pdfUrl} target="_blank" rel="noreferrer">Abrir PDF en otra pestaña</a></> : <div className={styles.emptyPreview}>
              <div className={styles.documentPlaceholder} aria-hidden="true"><div className={styles.placeholderHead}><strong>THE HOUSE</strong><span>FACTURA ELECTRÓNICA</span></div><div className={styles.placeholderDetails}><i /><i /><i /></div><div className={styles.placeholderRows}><i /><i /><i /></div><div className={styles.placeholderTotal}>TOTAL</div></div>
              <h3>Vista previa del comprobante</h3><p>Complete los datos y seleccione “Vista previa PDF” para revisar el documento antes de descargarlo.</p><span>Formato A4</span>
            </div>}
          </div>
          <div className={styles.summary}><h2>Resumen de importes</h2><dl><div><dt>Subtotal</dt><dd>{money(totales.bruto)}</dd></div><div><dt>Descuentos</dt><dd>− {money(totales.descuentos)}</dd></div><div><dt>Base imponible</dt><dd>{money(totales.base)}</dd></div><div><dt>IGV ({datos.igv}%)</dt><dd>{money(totales.igv)}</dd></div><div className={styles.grandTotal}><dt>Total del comprobante</dt><dd>{money(totales.total)}</dd></div></dl><p>Descuentos aplicados por concepto antes del cálculo del IGV.</p></div>
          {busy && <p className={styles.busy} role="status">{busy}…</p>}
        </aside>
      </div>
      <section className={styles.history}><div className={styles.historyHead}><div><h2>Comprobantes guardados <span>{facturas.length}</span></h2><p>Abre un documento para editarlo o volver a descargar su PDF.</p></div><label className={styles.search}><Search size={17} /><input aria-label="Buscar comprobantes" placeholder="Número, cliente o documento" value={busqueda} onChange={e => setBusqueda(e.target.value)} /></label></div>
        {filtradas.length ? <div className={styles.tableScroll}><table><thead><tr><th>Comprobante</th><th>Cliente</th><th>Emisión</th><th>Total</th><th>Acciones</th></tr></thead><tbody>{filtradas.map(f => <tr key={f.id}><td><strong>{numeroFactura(f.numero, f.serie, f.correlativo)}</strong><small>{nombreComprobante(f.datos.tipo)}</small></td><td>{f.datos.cliente.nombre}<small>{f.datos.cliente.tipoDocumento} {f.datos.cliente.documento}</small></td><td>{f.datos.fecha.split("-").reverse().join("/")}</td><td className={styles.amount}>{formatoDinero(calcularFactura(f.datos).total, f.datos.moneda)}</td><td><div className={styles.tableActions}><button disabled={!!busy} onClick={() => void abrir(f)}><Eye size={16} />Abrir</button><button className={styles.deleteButton} disabled={!!busy} aria-label={`Eliminar ${numeroFactura(f.numero, f.serie, f.correlativo)}`} onClick={() => void eliminar(f)}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div> : <div className={styles.emptyHistory}>{busqueda ? "No hay comprobantes que coincidan con tu búsqueda." : "Todavía no hay comprobantes. Guarda el primero desde el formulario."}</div>}
      </section>
    </>}
  </div>;
}
