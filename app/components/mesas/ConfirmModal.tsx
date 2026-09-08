"use client";

type Props = {
  abierto: boolean;
  titulo: string;
  mensaje: string;
  etiquetaConfirmar?: string;
  etiquetaCancelar?: string;
  peligroso?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
};

export default function ConfirmModal({
  abierto,
  titulo,
  mensaje,
  etiquetaConfirmar = "Confirmar",
  etiquetaCancelar = "Cancelar",
  peligroso = false,
  onConfirmar,
  onCancelar,
}: Props) {

  // IMPORTANTE:
  // Si el modal no está abierto, no renderizamos absolutamente nada.
  if (!abierto) return null;

  return (
    <div
      role="presentation"
      onClick={onCancelar}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        onClick={(evento) => evento.stopPropagation()}
        className="mesas-modal-entrada"
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "26px",
          maxWidth: "380px",
          width: "100%",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
        }}
      >
        <h3
          id="confirm-modal-title"
          style={{
            margin: "0 0 10px",
            color: "#111827",
          }}
        >
          {titulo}
        </h3>

        <p
          style={{
            margin: "0 0 22px",
            color: "#4b5563",
            whiteSpace: "pre-line",
            lineHeight: 1.5,
          }}
        >
          {mensaje}
        </p>

        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onCancelar}
            className="mesa-btn"
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              background: "white",
              color: "#374151",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {etiquetaCancelar}
          </button>

          <button
            onClick={onConfirmar}
            autoFocus
            className="mesa-btn"
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "none",
              background: peligroso ? "#ef4444" : "#2563eb",
              color: "white",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            {etiquetaConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}