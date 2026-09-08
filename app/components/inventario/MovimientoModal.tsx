// ARCHIVO: app/components/inventario/MovimientoModal.tsx
"use client";

import { useState } from "react";
import type {
  ProductoInventario,
  TipoMovimiento,
} from "../../../types/inventario";
import styles from "./inventario.module.css";

export type MovimientoContexto = {
  producto: ProductoInventario;
  tipo: TipoMovimiento;
};

type Props = {
  contexto: MovimientoContexto;
  onCancelar: () => void;
  onRegistrarEntrada: (
    productoId: number,
    cantidad: number,
    motivo: string
  ) => Promise<boolean>;
  onRegistrarSalida: (
    productoId: number,
    cantidad: number,
    motivo: string
  ) => Promise<boolean>;
  onRegistrarAjuste: (
    productoId: number,
    nuevoStock: number,
    motivo: string
  ) => Promise<boolean>;
};

const CONFIG: Record<
  TipoMovimiento,
  { titulo: string; color: string; etiquetaCantidad: string; icono: string }
> = {
  entrada: {
    titulo: "Registrar entrada",
    color: "#16a34a",
    etiquetaCantidad: "Cantidad a ingresar",
    icono: "📥",
  },
  salida: {
    titulo: "Registrar salida",
    color: "#ef4444",
    etiquetaCantidad: "Cantidad a retirar",
    icono: "➖",
  },
  ajuste: {
    titulo: "Ajustar stock",
    color: "#2563eb",
    etiquetaCantidad: "Nuevo stock",
    icono: "⚙️",
  },
};

const estiloInput: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  fontSize: 15,
  color: "#111827",
  boxSizing: "border-box",
  fontFamily: "Arial, sans-serif",
};

export default function MovimientoModal({
  contexto,
  onCancelar,
  onRegistrarEntrada,
  onRegistrarSalida,
  onRegistrarAjuste,
}: Props) {
  const { producto, tipo } = contexto;
  const config = CONFIG[tipo];

  const [cantidad, setCantidad] = useState(
    tipo === "ajuste" ? String(producto.stock) : ""
  );
  const [motivo, setMotivo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  async function manejarSubmit(evento: React.FormEvent) {
    evento.preventDefault();
    setErrorLocal(null);

    const valorNumerico = Number(cantidad);
    if (cantidad.trim() === "" || Number.isNaN(valorNumerico) || valorNumerico < 0) {
      setErrorLocal("Ingresa un valor numérico válido.");
      return;
    }
    if (tipo === "salida" && valorNumerico > producto.stock) {
      setErrorLocal(
        `No hay suficiente stock. Stock actual: ${producto.stock} ${producto.unidad}.`
      );
      return;
    }
    if (tipo === "ajuste" && motivo.trim() === "") {
      setErrorLocal("El motivo es obligatorio para un ajuste.");
      return;
    }

    setGuardando(true);
    let exito = false;
    if (tipo === "entrada") {
      exito = await onRegistrarEntrada(producto.id, valorNumerico, motivo);
    } else if (tipo === "salida") {
      exito = await onRegistrarSalida(producto.id, valorNumerico, motivo);
    } else {
      exito = await onRegistrarAjuste(producto.id, valorNumerico, motivo);
    }
    setGuardando(false);

    if (exito) {
      onCancelar();
    }
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
        aria-labelledby="movimiento-modal-titulo"
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
        <h2
          id="movimiento-modal-titulo"
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#111827",
            margin: "0 0 4px 0",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>{config.icono}</span>
          {config.titulo}
        </h2>

        <div
          style={{
            background: "#f4f6f8",
            borderRadius: 10,
            padding: 12,
            margin: "14px 0 18px 0",
          }}
        >
          <div style={{ fontSize: 13, color: "#6b7280" }}>Producto:</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
            {producto.nombre}
          </div>
          <div style={{ fontSize: 13, color: "#6b7280", marginTop: 6 }}>
            Stock actual:{" "}
            <strong style={{ color: "#111827" }}>
              {producto.stock} {producto.unidad}
            </strong>
          </div>
        </div>

        <form onSubmit={manejarSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#374151",
                marginBottom: 6,
              }}
            >
              {config.etiquetaCantidad}{" "}
              <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="number"
              min={0}
              step="any"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              required
              autoFocus
              style={estiloInput}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#374151",
                marginBottom: 6,
              }}
            >
              Motivo{" "}
              {tipo === "ajuste" && <span style={{ color: "#ef4444" }}>*</span>}
            </label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder={
                tipo === "entrada"
                  ? "Compra de proveedor"
                  : tipo === "salida"
                  ? "Venta, merma, traslado..."
                  : "Conteo físico, corrección..."
              }
              required={tipo === "ajuste"}
              style={estiloInput}
            />
          </div>

          {errorLocal && (
            <div
              style={{
                background: "#fef2f2",
                color: "#ef4444",
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 8,
                padding: "8px 12px",
                marginBottom: 14,
              }}
            >
              {errorLocal}
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={onCancelar}
              disabled={guardando}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                background: "white",
                color: "#374151",
                fontWeight: 600,
                cursor: guardando ? "default" : "pointer",
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: "none",
                background: config.color,
                color: "white",
                fontWeight: 600,
                cursor: guardando ? "default" : "pointer",
                opacity: guardando ? 0.7 : 1,
              }}
            >
              {guardando ? "Guardando..." : "Confirmar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
