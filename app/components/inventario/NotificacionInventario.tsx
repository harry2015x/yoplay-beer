// ARCHIVO: app/components/inventario/NotificacionInventario.tsx
"use client";

import { useEffect } from "react";
import type { NotificacionInventario as NotificacionInventarioType } from "../../../types/inventario";
import styles from "./inventario.module.css";

type Props = {
  notificacion: NotificacionInventarioType;
  onCerrar: () => void;
};

const COLORES: Record<string, { fondo: string; texto: string; icono: string }> = {
  success: { fondo: "#16a34a", texto: "#ffffff", icono: "✅" },
  error: { fondo: "#ef4444", texto: "#ffffff", icono: "⚠️" },
  info: { fondo: "#2563eb", texto: "#ffffff", icono: "ℹ️" },
};

export default function NotificacionInventario({
  notificacion,
  onCerrar,
}: Props) {
  useEffect(() => {
    if (!notificacion) return;
    const temporizador = setTimeout(() => {
      onCerrar();
    }, 4000);
    return () => clearTimeout(temporizador);
  }, [notificacion, onCerrar]);

  if (!notificacion) return null;

  const colores = COLORES[notificacion.tipo] ?? COLORES.info;

  return (
    <div
      className={styles.toast}
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 100,
        maxWidth: 360,
        background: colores.fondo,
        color: colores.texto,
        padding: "14px 16px",
        borderRadius: 12,
        boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
      }}
    >
      <span style={{ fontSize: 18, lineHeight: 1 }}>{colores.icono}</span>
      <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>
        {notificacion.mensaje}
      </span>
      <button
        type="button"
        onClick={onCerrar}
        aria-label="Cerrar notificación"
        style={{
          background: "transparent",
          border: "none",
          color: colores.texto,
          cursor: "pointer",
          fontSize: 16,
          lineHeight: 1,
          padding: 0,
          opacity: 0.85,
        }}
      >
        ✕
      </button>
    </div>
  );
}
