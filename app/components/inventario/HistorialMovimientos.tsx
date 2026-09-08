// ARCHIVO: app/components/inventario/HistorialMovimientos.tsx
"use client";

import { useMemo, useState } from "react";
import type {
  FiltroMovimiento,
  MovimientoInventario,
} from "../../../types/inventario";
import { formatoFechaHora } from "../../../lib/formato";
import styles from "./inventario.module.css";

type Props = {
  movimientos: MovimientoInventario[];
  cargando: boolean;
  error: string | null;
  onReintentar: () => void;
};

const CONFIG_TIPO: Record<
  string,
  { etiqueta: string; color: string; icono: string }
> = {
  entrada: { etiqueta: "Entrada", color: "#16a34a", icono: "📥" },
  salida: { etiqueta: "Salida", color: "#ef4444", icono: "➖" },
  ajuste: { etiqueta: "Ajuste", color: "#2563eb", icono: "⚙️" },
};

const OPCIONES_FILTRO: { valor: FiltroMovimiento; etiqueta: string }[] = [
  { valor: "todos", etiqueta: "Todos" },
  { valor: "entrada", etiqueta: "Entradas" },
  { valor: "salida", etiqueta: "Salidas" },
  { valor: "ajuste", etiqueta: "Ajustes" },
];

export default function HistorialMovimientos({
  movimientos,
  cargando,
  error,
  onReintentar,
}: Props) {
  const [filtro, setFiltro] = useState<FiltroMovimiento>("todos");

  const movimientosFiltrados = useMemo(() => {
    if (filtro === "todos") return movimientos;
    return movimientos.filter((m) => m.tipo === filtro);
  }, [movimientos, filtro]);

  return (
    <div
      style={{
        background: "white",
        borderRadius: 14,
        padding: 20,
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        marginTop: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <h2
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#111827",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          📋 Historial de movimientos
        </h2>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {OPCIONES_FILTRO.map((opcion) => {
            const activo = filtro === opcion.valor;
            return (
              <button
                key={opcion.valor}
                type="button"
                onClick={() => setFiltro(opcion.valor)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: activo ? "1px solid #172131" : "1px solid #e5e7eb",
                  background: activo ? "#172131" : "white",
                  color: activo ? "white" : "#374151",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {opcion.etiqueta}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "#fef2f2",
            borderRadius: 10,
            padding: 16,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <span style={{ color: "#ef4444", fontSize: 13, fontWeight: 600 }}>
            {error}
          </span>
          <button
            type="button"
            onClick={onReintentar}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "none",
              background: "#ef4444",
              color: "white",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      )}

      {!error && cargando && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={styles.skeleton}
              style={{ height: 48, borderRadius: 10 }}
            />
          ))}
        </div>
      )}

      {!error && !cargando && movimientosFiltrados.length === 0 && (
        <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
          No hay movimientos registrados para este filtro.
        </p>
      )}

      {!error && !cargando && movimientosFiltrados.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {movimientosFiltrados.map((movimiento) => {
              const config = CONFIG_TIPO[movimiento.tipo];
              return (
                <div
                  key={movimiento.id}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 14,
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      color: "white",
                      background: config.color,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {config.icono} {config.etiqueta}
                  </span>

                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#111827",
                      flex: "1 1 160px",
                      minWidth: 140,
                    }}
                  >
                    {movimiento.productoNombre ?? "Producto eliminado"}
                  </span>

                  <span style={{ fontSize: 13, color: "#374151", minWidth: 90 }}>
                    Cant: <strong>{movimiento.cantidad}</strong>
                  </span>

                  <span style={{ fontSize: 13, color: "#6b7280", minWidth: 120 }}>
                    {movimiento.stockAnterior} → {movimiento.stockNuevo}
                  </span>

                  <span
                    style={{
                      fontSize: 12,
                      color: "#6b7280",
                      flex: "1 1 140px",
                      minWidth: 120,
                    }}
                  >
                    {movimiento.motivo ?? "—"}
                  </span>

                  <span
                    style={{
                      fontSize: 12,
                      color: "#6b7280",
                      whiteSpace: "nowrap",
                      marginLeft: "auto",
                    }}
                  >
                    {formatoFechaHora(movimiento.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
