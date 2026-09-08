// ARCHIVO: app/components/inventario/InventarioFiltros.tsx
"use client";

import { useState } from "react";
import type { FiltroStock } from "../../../types/inventario";

type Props = {
  busqueda: string;
  onBusquedaChange: (valor: string) => void;
  filtro: FiltroStock;
  onFiltroChange: (valor: FiltroStock) => void;
};

const OPCIONES: { valor: FiltroStock; etiqueta: string }[] = [
  { valor: "todos", etiqueta: "Todos" },
  { valor: "normal", etiqueta: "Stock normal" },
  { valor: "bajo", etiqueta: "Stock bajo" },
  { valor: "sin_stock", etiqueta: "Sin stock" },
  { valor: "inactivos", etiqueta: "Inactivos" },
];

export default function InventarioFiltros({
  busqueda,
  onBusquedaChange,
  filtro,
  onFiltroChange,
}: Props) {
  const [enfocado, setEnfocado] = useState(false);

  return (
    <div
      style={{
        background: "white",
        borderRadius: 14,
        padding: 16,
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        marginBottom: 20,
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        alignItems: "center",
      }}
    >
      <div style={{ position: "relative", flex: "1 1 240px", minWidth: 200 }}>
        <span
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: 15,
            opacity: 0.6,
          }}
        >
          🔍
        </span>
        <input
          type="text"
          value={busqueda}
          onChange={(evento) => onBusquedaChange(evento.target.value)}
          onFocus={() => setEnfocado(true)}
          onBlur={() => setEnfocado(false)}
          placeholder="Buscar producto..."
          aria-label="Buscar producto por nombre o categoría"
          style={{
            width: "100%",
            padding: "10px 12px 10px 36px",
            border: enfocado ? "1px solid transparent" : "1px solid #d1d5db",
            outline: enfocado ? "2px solid #2563eb" : "none",
            outlineOffset: 0,
            borderRadius: 8,
            fontSize: 15,
            color: "#111827",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {OPCIONES.map((opcion) => {
          const activo = filtro === opcion.valor;
          return (
            <button
              key={opcion.valor}
              type="button"
              onClick={() => onFiltroChange(opcion.valor)}
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                border: activo ? "1px solid #f59e0b" : "1px solid #e5e7eb",
                background: activo ? "#f59e0b" : "white",
                color: activo ? "white" : "#374151",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "filter 120ms ease, transform 120ms ease",
              }}
              onMouseDown={(evento) => {
                evento.currentTarget.style.transform = "scale(0.98)";
              }}
              onMouseUp={(evento) => {
                evento.currentTarget.style.transform = "scale(1)";
              }}
            >
              {opcion.etiqueta}
            </button>
          );
        })}
      </div>
    </div>
  );
}
