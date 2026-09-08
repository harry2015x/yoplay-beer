"use client";

import { Notificacion as NotificacionTipo } from "../../../types/mesas";

type Props = {
  notificacion: NotificacionTipo;
  onCerrar: () => void;
};

export default function Notificacion({ notificacion, onCerrar }: Props) {
  const exito = notificacion.tipo === "success";

  return (
    <div
      role="status"
      aria-live="polite"
      className="mesas-toast"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        background: exito ? "#166534" : "#991b1b",
        color: "white",
        padding: "14px 18px",
        borderRadius: "10px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        maxWidth: "340px",
        zIndex: 80,
      }}
    >
      <span aria-hidden="true">{exito ? "✅" : "⚠️"}</span>
      <span style={{ fontSize: "14px" }}>{notificacion.mensaje}</span>
      <button
        onClick={onCerrar}
        aria-label="Cerrar notificación"
        style={{
          background: "transparent",
          border: "none",
          color: "white",
          cursor: "pointer",
          fontSize: "16px",
          marginLeft: "4px",
        }}
      >
        ×
      </button>
    </div>
  );
}




