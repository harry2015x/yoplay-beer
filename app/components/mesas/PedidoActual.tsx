"use client";

import { ItemPedido, formatoCOP } from "../../../types/mesas";

type Props = {
  productos: ItemPedido[];
  total: number;
  onAumentar: (productoId: number) => void;
  onDisminuir: (productoId: number) => void;
  onEliminar: (productoId: number) => void;
  onSolicitarCierre: () => void;
};

export default function PedidoActual({
  productos,
  total,
  onAumentar,
  onDisminuir,
  onEliminar,
  onSolicitarCierre,
}: Props) {
  return (
    <div
      style={{
        background: "#f9fafb",
        borderRadius: "14px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <h3 style={{ marginTop: 0 }}>ðŸ§¾ Pedido actual</h3>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {productos.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No hay productos agregados todavÃ­a.</p>
        ) : (
          productos.map((item) => (
            <div
              key={item.productoId}
              style={{
                padding: "14px 0",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <strong>{item.nombre}</strong>
                  <br />
                  <span style={{ color: "#6b7280", fontSize: "13px" }}>
                    {formatoCOP(item.precio)} c/u
                  </span>
                </div>
                <strong>{formatoCOP(item.precio * item.cantidad)}</strong>
              </div>

              <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  onClick={() => onDisminuir(item.productoId)}
                  aria-label={`Restar una unidad de ${item.nombre}`}
                  className="mesa-btn"
                  style={{
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    width: "30px",
                    height: "30px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  âˆ’
                </button>

                <strong>{item.cantidad}</strong>

                <button
                  onClick={() => onAumentar(item.productoId)}
                  aria-label={`Sumar una unidad de ${item.nombre}`}
                  className="mesa-btn"
                  style={{
                    background: "#16a34a",
                    color: "white",
                    border: "none",
                    width: "30px",
                    height: "30px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  +
                </button>

                <button
                  onClick={() => onEliminar(item.productoId)}
                  aria-label={`Eliminar ${item.nombre} del pedido`}
                  className="mesa-btn"
                  style={{
                    marginLeft: "auto",
                    background: "transparent",
                    border: "1px solid #d1d5db",
                    color: "#6b7280",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div
        style={{
          marginTop: "16px",
          paddingTop: "16px",
          borderTop: "2px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "18px" }}>Total</h2>
        <h2 style={{ margin: 0, color: "#16a34a" }}>{formatoCOP(total)}</h2>
      </div>

      <button
        onClick={onSolicitarCierre}
        disabled={total <= 0}
        className="mesa-btn"
        style={{
          width: "100%",
          marginTop: "14px",
          background: total <= 0 ? "#fca5a5" : "#ef4444",
          color: "white",
          border: "none",
          padding: "14px",
          borderRadius: "8px",
          cursor: total <= 0 ? "not-allowed" : "pointer",
          fontWeight: 700,
          fontSize: "16px",
        }}
      >
        Cobrar / Cerrar cuenta
      </button>
    </div>
  );
}




