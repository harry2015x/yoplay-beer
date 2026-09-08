"use client";

import { Mesa, PRODUCTOS, formatoCOP } from "../../../types/mesas";
import PedidoActual from "./PedidoActual";

type Props = {
  mesa: Mesa;
  onCerrarModal: () => void;
  onAgregarProducto: (producto: (typeof PRODUCTOS)[number]) => void;
  onAumentar: (productoId: number) => void;
  onDisminuir: (productoId: number) => void;
  onEliminar: (productoId: number) => void;
  onSolicitarCierre: (mesa: Mesa) => void;
};

export default function MesaModal({
  mesa,
  onCerrarModal,
  onAgregarProducto,
  onAumentar,
  onDisminuir,
  onEliminar,
  onSolicitarCierre,
}: Props) {
  return (
    <div
      role="presentation"
      onClick={onCerrarModal}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "20px",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mesa-modal-title"
        onClick={(evento) => evento.stopPropagation()}
        className="mesas-modal-entrada"
        style={{
          background: "white",
          borderRadius: "18px",
          width: "100%",
          maxWidth: "900px",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div>
            <h2 id="mesa-modal-title" style={{ margin: 0 }}>
              ðŸª‘ Mesa {mesa.numero}
            </h2>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: "999px",
                background: "#fef3c7",
                color: "#92400e",
              }}
            >
              OCUPADA
            </span>
          </div>

          <button
            onClick={onCerrarModal}
            aria-label="Cerrar panel de la mesa"
            className="mesa-btn"
            style={{
              background: "#f3f4f6",
              border: "none",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            Ã—
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(220px, 1fr) minmax(280px, 1.2fr)",
            gap: "20px",
            padding: "20px 24px",
            overflowY: "auto",
          }}
        >
          <div>
            <h3 style={{ marginTop: 0 }}>ðŸº Productos</h3>
            {PRODUCTOS.map((producto) => (
              <div
                key={producto.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <div>
                  <strong>{producto.nombre}</strong>
                  <br />
                  <span style={{ color: "#6b7280", fontSize: "14px" }}>
                    {formatoCOP(producto.precio)}
                  </span>
                </div>

                <button
                  onClick={() => onAgregarProducto(producto)}
                  aria-label={`Agregar ${producto.nombre} a la mesa ${mesa.numero}`}
                  className="mesa-btn"
                  style={{
                    background: "#16a34a",
                    color: "white",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  + Agregar
                </button>
              </div>
            ))}
          </div>

          <PedidoActual
            productos={mesa.productos}
            total={mesa.total}
            onAumentar={onAumentar}
            onDisminuir={onDisminuir}
            onEliminar={onEliminar}
            onSolicitarCierre={() => onSolicitarCierre(mesa)}
          />
        </div>
      </div>
    </div>
  );
}




