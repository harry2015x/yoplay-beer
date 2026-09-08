// ARCHIVO: app/components/inventario/InventarioResumen.tsx
"use client";

import { useState } from "react";
import type { ResumenInventario } from "../../../types/inventario";
import { formatoCOP } from "../../../lib/formato";

type Props = {
  resumen: ResumenInventario;
};

type Tarjeta = {
  id: string;
  icono: string;
  etiqueta: string;
  valor: string;
  acento: string;
};

function TarjetaResumen({ tarjeta }: { tarjeta: Tarjeta }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "white",
        padding: 20,
        borderRadius: 12,
        boxShadow: hover
          ? "0 10px 24px rgba(0,0,0,0.1)"
          : "0 2px 10px rgba(0,0,0,0.08)",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
        transition: "transform 160ms ease, box-shadow 160ms ease",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: `${tarjeta.acento}1a`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          flexShrink: 0,
        }}
      >
        {tarjeta.icono}
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#6b7280",
            marginBottom: 2,
          }}
        >
          {tarjeta.etiqueta}
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#111827",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {tarjeta.valor}
        </div>
      </div>
    </div>
  );
}

export default function InventarioResumen({ resumen }: Props) {
  const tarjetas: Tarjeta[] = [
    {
      id: "total",
      icono: "📦",
      etiqueta: "Total productos",
      valor: String(resumen.totalProductos),
      acento: "#2563eb",
    },
    {
      id: "unidades",
      icono: "📊",
      etiqueta: "Unidades en stock",
      valor: String(resumen.unidadesEnStock),
      acento: "#16a34a",
    },
    {
      id: "bajo",
      icono: "⚠️",
      etiqueta: "Stock bajo",
      valor: String(resumen.stockBajo),
      acento: "#f59e0b",
    },
    {
      id: "valor",
      icono: "💰",
      etiqueta: "Valor estimado",
      valor: formatoCOP(resumen.valorEstimado),
      acento: "#172131",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 20,
        marginBottom: 20,
      }}
    >
      {tarjetas.map((tarjeta) => (
        <TarjetaResumen key={tarjeta.id} tarjeta={tarjeta} />
      ))}
    </div>
  );
}
