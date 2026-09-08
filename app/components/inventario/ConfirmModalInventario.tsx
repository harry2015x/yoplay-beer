// ARCHIVO: app/components/inventario/ConfirmModalInventario.tsx
"use client";

import { useState } from "react";
import type { ProductoInventario } from "../../../types/inventario";
import styles from "./inventario.module.css";

type Props = {
  producto: ProductoInventario;
  onCancelar: () => void;
  onConfirmar: () => Promise<void> | void;
};

export default function ConfirmModalInventario({
  producto,
  onCancelar,
  onConfirmar,
}: Props) {
  const [eliminando, setEliminando] = useState(false);

  async function manejarConfirmar() {
    setEliminando(true);
    await onConfirmar();
    setEliminando(false);
  }

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={onCancelar}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 16,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-eliminar-titulo"
        onClick={(evento) => evento.stopPropagation()}
        className={styles.modal}
        style={{
          background: "white",
          borderRadius: 18,
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
          padding: 24,
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 8 }}>🗑️</div>
        <h2
          id="confirm-eliminar-titulo"
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#111827",
            margin: "0 0 8px 0",
          }}
        >
          ¿Eliminar producto?
        </h2>
        <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 4px 0" }}>
          Esta acción eliminará el producto:
        </p>
        <p
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#111827",
            margin: "0 0 20px 0",
          }}
        >
          {producto.nombre}
        </p>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px 0" }}>
          ¿Deseas continuar? Esta acción no se puede deshacer.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onCancelar}
            disabled={eliminando}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              background: "white",
              color: "#374151",
              fontWeight: 600,
              cursor: eliminando ? "default" : "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={manejarConfirmar}
            disabled={eliminando}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              background: "#ef4444",
              color: "white",
              fontWeight: 600,
              cursor: eliminando ? "default" : "pointer",
              opacity: eliminando ? 0.7 : 1,
            }}
          >
            {eliminando ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
