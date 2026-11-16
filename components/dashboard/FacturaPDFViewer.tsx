"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import styles from "./FacturaPDFViewer.module.css";

export function FacturaPDFViewer({ url }: { url: string }) {
  const [documento, setDocumento] = useState<PDFDocumentProxy | null>(null);
  const [pagina, setPagina] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [width, setWidth] = useState(0);
  const [rendering, setRendering] = useState(true);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let active = true;
    let task: ReturnType<typeof import("pdfjs-dist")["getDocument"]> | undefined;
    setDocumento(null); setPagina(1); setZoom(1); setError(""); setRendering(true);
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        if (!active) return;
        pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
        const response = await fetch(url);
        const data = new Uint8Array(await response.arrayBuffer());
        if (!active) return;
        task = pdfjs.getDocument({ data, useSystemFonts: true });
        const loaded = await task.promise;
        if (active) setDocumento(loaded);
      } catch { if (active) { setError("No se pudo mostrar el PDF aquí. Puedes descargarlo o abrirlo en otra pestaña."); setRendering(false); } }
    })();
    return () => { active = false; void task?.destroy(); };
  }, [url]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!documento || !canvas || !width) return;
    let active = true;
    let renderTask: RenderTask | undefined;
    setRendering(true); setError("");
    (async () => {
      try {
        const page = await documento.getPage(pagina);
        if (!active) return;
        const base = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: Math.max(0.1, (width - 32) / base.width) * zoom });
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.ceil(viewport.width * ratio);
        canvas.height = Math.ceil(viewport.height * ratio);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        renderTask = page.render({ canvas, viewport, transform: [ratio, 0, 0, ratio, 0, 0] });
        await renderTask.promise;
        if (active) setRendering(false);
      } catch (err) {
        if (active && (err as Error).name !== "RenderingCancelledException") {
          setError("No se pudo visualizar esta página. Abre el PDF en otra pestaña."); setRendering(false);
        }
      }
    })();
    return () => { active = false; renderTask?.cancel(); };
  }, [documento, pagina, width, zoom]);

  return <div className={styles.viewer}>
    <div className={styles.toolbar}>
      <div className={styles.pagination}>
        <button type="button" aria-label="Página anterior del PDF" disabled={!documento || pagina === 1} onClick={() => setPagina(p => p - 1)}><ChevronLeft size={17} /></button>
        <span>Página {pagina} de {documento?.numPages || "…"}</span>
        <button type="button" aria-label="Página siguiente del PDF" disabled={!documento || pagina >= documento.numPages} onClick={() => setPagina(p => p + 1)}><ChevronRight size={17} /></button>
      </div>
      <label><span className={styles.srOnly}>Zoom del PDF</span><select aria-label="Zoom del PDF" value={zoom} onChange={e => setZoom(Number(e.target.value))}><option value={1}>Ajustar al ancho</option><option value={1.25}>125%</option><option value={1.5}>150%</option><option value={2}>200%</option></select></label>
    </div>
    <div ref={viewportRef} className={styles.viewport} aria-busy={rendering}>
      {error ? <p role="alert" className={styles.message}>{error}</p> : <>
        {rendering && <p className={styles.loading} role="status">Preparando vista previa…</p>}
        <div className={styles.stage}><canvas ref={canvasRef} title="Vista previa del comprobante PDF" role="img" aria-label={`Página ${pagina} del comprobante PDF`} data-rendered={documento && !rendering ? "true" : "false"} /></div>
      </>}
    </div>
  </div>;
}
