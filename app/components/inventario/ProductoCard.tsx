// ARCHIVO: app/components/inventario/ProductoCard.tsx
"use client";

import { useState } from "react";
import {
  calcularEstadoStock,
  type ProductoInventario,
} from "../../../types/inventario";
import { formatoCOP } from "../../../lib/formato";

type Props = {
  producto: ProductoInventario;
  onEntrada: (producto: ProductoInventario) => void;
  onSalida: (producto: ProductoInventario) => void;
  onAjustar: (producto: ProductoInventario) => void;
  onEditar: (producto: ProductoInventario) => void;
  onEliminar: (producto: ProductoInventario) => void;
};

const ESTADO_COLOR: Record<string, string> = {
  normal: "#16a34a",
  bajo: "#f59e0b",
  sin_stock: "#ef4444",
};

const ESTADO_TEXTO: Record<string, string> = {
  normal: "Stock normal",
  bajo: "Stock bajo",
  sin_stock: "Sin stock",
};

function Badge({ texto, color }: { texto: string; color: string }) {
  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        color: "white",
        background: color,
        whiteSpace: "nowrap",
      }}
    >
      {texto}
    </span>
  );
}

function BotonAccion({
  etiqueta,
  icono,
  color,
  onClick,
  ariaLabel,
}: {
  etiqueta: string;
  icono: string;
  color: string;
  onClick: () => void;
  ariaLabel: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 10px",
        borderRadius: 8,
        border: "none",
        background: color,
        color: "white",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        filter: hover ? "brightness(1.07)" : "brightness(1)",
        transition: "filter 120ms ease, transform 120ms ease",
      }}
    >
      <span aria-hidden="true">{icono}</span>
      <span>{etiqueta}</span>
    </button>
  );
}

export default function ProductoCard({
  producto,
  onEntrada,
  onSalida,
  onAjustar,
  onEditar,
  onEliminar,
}: Props) {
  const [hover, setHover] = useState(false);
  const estado = calcularEstadoStock(producto);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "white",
        borderRadius: 14,
        padding: 18,
        boxShadow: hover
          ? "0 10px 24px rgba(0,0,0,0.1)"
          : "0 2px 10px rgba(0,0,0,0.06)",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
        transition: "transform 160ms ease, box-shadow 160ms ease",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 16,
      }}
    >
      {/* Indicador de stock */}
      <div
        aria-hidden="true"
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: ESTADO_COLOR[estado],
          flexShrink: 0,
        }}
      />

      {/* Nombre, categoría y badges */}
      <div style={{ flex: "1 1 220px", minWidth: 200 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
            {producto.nombre}
          </span>
          <Badge
            texto={producto.activo ? "Activo" : "Inactivo"}
            color={producto.activo ? "#16a34a" : "#6b7280"}
          />
          {estado !== "normal" && (
            <Badge texto={ESTADO_TEXTO[estado]} color={ESTADO_COLOR[estado]} />
          )}
        </div>
        <div style={{ fontSize: 13, color: "#6b7280" }}>
          {producto.categoria ?? "Sin categoría"}
        </div>
      </div>

      {/* Stock */}
      <div style={{ minWidth: 110 }}>
        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>
          Stock
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
          {producto.stock} {producto.unidad}
        </div>
        <div style={{ fontSize: 11, color: "#6b7280" }}>
          Mínimo: {producto.stockMinimo}
        </div>
      </div>

      {/* Precios */}
      <div style={{ minWidth: 120 }}>
        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>
          Precio compra
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
          {producto.precioCompra !== null
            ? formatoCOP(producto.precioCompra)
            : "—"}
        </div>
      </div>
      <div style={{ minWidth: 120 }}>
        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>
          Precio venta
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
          {producto.precioVenta !== null
            ? formatoCOP(producto.precioVenta)
            : "—"}
        </div>
      </div>

      {/* Acciones */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginLeft: "auto",
        }}
      >
        <BotonAccion
          etiqueta="Entrada"
          icono="📥"
          color="#16a34a"
          onClick={() => onEntrada(producto)}
          ariaLabel={`Registrar entrada para ${producto.nombre}`}
        />
        <BotonAccion
          etiqueta="Salida"
          icono="➖"
          color="#ef4444"
          onClick={() => onSalida(producto)}
          ariaLabel={`Registrar salida para ${producto.nombre}`}
        />
        <BotonAccion
          etiqueta="Ajustar"
          icono="⚙️"
          color="#2563eb"
          onClick={() => onAjustar(producto)}
          ariaLabel={`Ajustar stock de ${producto.nombre}`}
        />
        <BotonAccion
          etiqueta="Editar"
          icono="✏️"
          color="#172131"
          onClick={() => onEditar(producto)}
          ariaLabel={`Editar ${producto.nombre}`}
        />
        <BotonAccion
          etiqueta="Eliminar"
          icono="🗑️"
          color="#ef4444"
          onClick={() => onEliminar(producto)}
          ariaLabel={`Eliminar ${producto.nombre}`}
        />
      </div>
    </div>
  );
}
