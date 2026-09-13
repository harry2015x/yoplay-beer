"use client";

import { useEffect, useState } from "react";
import { Mesa, cantidadProductos, formatoCOP } from "../../../types/mesas";

type Props = {
  mesa: Mesa;
  onAbrir: (id: number) => void;
  onGestionar: (id: number) => void;
  onSolicitarCierre: (mesa: Mesa) => void;

  /** true si el usuario autenticado es administrador. */
  esAdministrador: boolean;

  /** Abre la confirmación de eliminación (solo se llama si la mesa está Libre). */
  onSolicitarEliminar: (mesa: Mesa) => void;

  /** true mientras esta mesa en particular se está eliminando en Supabase. */
  eliminando?: boolean;
};

function tiempoAbierta(desde: Date | null): string | null {
  if (!desde) return null;

  const minutos = Math.max(0, Math.floor((Date.now() - desde.getTime()) / 60000));

  if (minutos < 1) return "Recién abierta";
  if (minutos < 60) return `${minutos} min abierta`;

  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return `${horas}h ${resto}min abierta`;
}

export default function MesaCard({
  mesa,
  onAbrir,
  onGestionar,
  onSolicitarCierre,
  esAdministrador,
  onSolicitarEliminar,
  eliminando = false,
}: Props) {
  const [, forzarRefresco] = useState(0);
  const libre = mesa.estado === "Libre";

  // Refresca el texto de "tiempo abierta" cada minuto sin volver a pedir datos.
  useEffect(() => {
    if (libre) return;
    const intervalo = setInterval(() => forzarRefresco((n) => n + 1), 60000);
    return () => clearInterval(intervalo);
  }, [libre]);

  const totalProductos = cantidadProductos(mesa.productos);
  const tiempo = tiempoAbierta(mesa.abiertaDesde);

  return (
    <article
      className="mesa-card"
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
        borderTop: `4px solid ${libre ? "#22c55e" : "#f59e0b"}`,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "30px" }} aria-hidden="true">
            🪑
          </span>
          <h3 style={{ margin: 0, fontSize: "18px" }}>Mesa {mesa.numero}</h3>
        </div>

        <span
          style={{
            fontSize: "12px",
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: "999px",
            background: libre ? "#dcfce7" : "#fef3c7",
            color: libre ? "#166534" : "#92400e",
          }}
        >
          {libre ? "LIBRE" : "OCUPADA"}
        </span>
      </div>

      {!libre && (
        <div style={{ fontSize: "14px", color: "#374151", display: "flex", flexDirection: "column", gap: "2px" }}>
          <span>
            Total: <strong>{formatoCOP(mesa.total)}</strong>
          </span>
          <span style={{ color: "#6b7280" }}>
            {totalProductos} {totalProductos === 1 ? "producto" : "productos"}
          </span>
          {tiempo && <span style={{ color: "#9ca3af", fontSize: "12px" }}>{tiempo}</span>}
        </div>
      )}

      {libre ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button
            onClick={() => onAbrir(mesa.id)}
            aria-label={`Abrir mesa ${mesa.numero}`}
            className="mesa-btn"
            style={{
              width: "100%",
              background: "#16a34a",
              color: "white",
              border: "none",
              padding: "12px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Abrir mesa
          </button>

          {/* ===================================================
              ELIMINAR MESA (SOLO ADMINISTRADOR, SOLO SI ESTÁ LIBRE)
          =================================================== */}

          {esAdministrador && (
            <button
              onClick={() => onSolicitarEliminar(mesa)}
              disabled={eliminando}
              aria-label={`Eliminar Mesa ${mesa.numero}`}
              className="mesa-btn"
              style={{
                width: "100%",
                minHeight: "44px",
                background: "transparent",
                color: "#ef4444",
                border: "1px solid #fecaca",
                padding: "10px",
                borderRadius: "8px",
                cursor: eliminando ? "default" : "pointer",
                opacity: eliminando ? 0.6 : 1,
                fontWeight: 700,
              }}
            >
              {eliminando ? "Eliminando..." : "🗑️ Eliminar"}
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button
            onClick={() => onGestionar(mesa.id)}
            aria-label={`Gestionar mesa ${mesa.numero}`}
            className="mesa-btn"
            style={{
              width: "100%",
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "12px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Gestionar mesa
          </button>

          <button
  onClick={() => onSolicitarCierre(mesa)}
  aria-label={`Cerrar cuenta de la mesa ${mesa.numero}`}
  className="mesa-btn"
  style={{
    width: "100%",
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 700,
  }}
>
  Cerrar cuenta
</button>
        </div>
      )}
    </article>
  );
}




