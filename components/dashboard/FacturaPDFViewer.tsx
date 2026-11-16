"use client";

import styles from "./FacturaPDFViewer.module.css";

export function FacturaPDFViewer({ url }: { url: string }) {
  // El navegador recibe el PDF original. La altura es fija y no depende
  // de eventos de carga, medidas del documento ni ciclos de renderizado.
  return <div className={styles.viewer}>
    <iframe
      key={url}
      title="Vista previa del comprobante PDF"
      src={`${url}#view=FitH&navpanes=0`}
      className={styles.frame}
    />
  </div>;
}
