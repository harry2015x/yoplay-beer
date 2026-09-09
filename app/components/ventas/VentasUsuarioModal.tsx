"use client";

import type { Venta } from "../../../types/mesas";

// ============================================================
// TIPO INTERNO PARA EL DETALLE DE UNA VENTA
// ============================================================

type VentaUsuario = Venta & {
  createdAt?: string | null;
  closedAt?: string | null;
};

// ============================================================
// TIPO DEL RESUMEN DE VENTAS DEL USUARIO
// ============================================================

export type ResumenVentasUsuario = {
  usuarioId: string | null;

  usuarioNombre: string;

  cantidadVentas: number;

  totalVentas: number;

  ventas: VentaUsuario[];
};

// ============================================================
// PROPS
// ============================================================

type Props = {
  resumen: ResumenVentasUsuario;

  onCerrar: () => void;
};

// ============================================================
// FORMATO MONEDA
// ============================================================

function formatoCOP(valor: number): string {
  return valor.toLocaleString("es-CO", {
    style: "currency",

    currency: "COP",

    minimumFractionDigits: 0,

    maximumFractionDigits: 0,
  });
}

// ============================================================
// FORMATO HORA
// ============================================================

function formatoHora(
  fecha: string | Date | null | undefined
): string {
  if (!fecha) {
    return "--:--";
  }

  const fechaObjeto =
    fecha instanceof Date
      ? fecha
      : new Date(fecha);

  if (Number.isNaN(fechaObjeto.getTime())) {
    return "--:--";
  }

  return fechaObjeto.toLocaleTimeString(
    "es-CO",
    {
      hour: "2-digit",

      minute: "2-digit",

      hour12: true,
    }
  );
}

// ============================================================
// COMPONENTE
// ============================================================

export default function VentasUsuarioModal({
  resumen,
  onCerrar,
}: Props) {
  return (
    <div
      className="ventas-modal-overlay"
      onClick={onCerrar}
    >
      <div
        className="ventas-modal"
        onClick={(event) => event.stopPropagation()}
      >
        {/* ================================================ */}
        {/* HEADER */}
        {/* ================================================ */}

        <div className="ventas-modal-header">
          <div>
            <h2>
              💰 VENTAS DE{" "}
              {resumen.usuarioNombre.toUpperCase()}
            </h2>

            <p>
              {resumen.cantidadVentas}{" "}
              {resumen.cantidadVentas === 1
                ? "venta realizada"
                : "ventas realizadas"}
            </p>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="ventas-modal-close"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* ================================================ */}
        {/* VENTAS */}
        {/* ================================================ */}

        <div className="ventas-lista">
          {resumen.ventas.length === 0 ? (
            <div className="ventas-vacias">
              No hay ventas registradas para este usuario.
            </div>
          ) : (
            resumen.ventas.map(
              (venta: VentaUsuario) => (
                <div
                  key={venta.id}
                  className="venta-item"
                >
                  {/* HORA */}

                  <div className="venta-hora">
                    ⏰{" "}
                    {formatoHora(
                      venta.closedAt ??
                        venta.createdAt ??
                        venta.fecha
                    )}
                  </div>

                  {/* MESA */}

                  <div className="venta-mesa">
                    🪑 Mesa{" "}
                    {venta.mesaNumero ?? "-"}
                  </div>

                  {/* TOTAL */}

                  <div className="venta-total">
                    {formatoCOP(venta.total)}
                  </div>
                </div>
              )
            )
          )}
        </div>

        {/* ================================================ */}
        {/* FOOTER */}
        {/* ================================================ */}

        <div className="ventas-modal-footer">
          <span>TOTAL DEL USUARIO</span>

          <strong>
            {formatoCOP(
              resumen.totalVentas
            )}
          </strong>
        </div>
      </div>
    </div>
  );
}