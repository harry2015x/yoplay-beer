"use client";

import { useEffect } from "react";

import type { VentaHistorial } from "../../../types/reportes";
import { formatoCOP } from "../../../types/reportes";

type Props = {
  venta: VentaHistorial;
  onCerrar: () => void;
};

function formatoFechaBogota(fechaISO: string | null): string {
  if (!fechaISO) return "-";
  const fecha = new Date(fechaISO);
  if (Number.isNaN(fecha.getTime())) return "-";
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(fecha);
}

function formatoHoraBogota(fechaISO: string | null): string {
  if (!fechaISO) return "--:--";
  const fecha = new Date(fechaISO);
  if (Number.isNaN(fecha.getTime())) return "--:--";
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(fecha);
}

export default function DetalleVentaModal({ venta, onCerrar }: Props) {
  useEffect(() => {
    function onKeyDown(evento: KeyboardEvent) {
      if (evento.key === "Escape") onCerrar();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCerrar]);

  const referencia = venta.closedAt ?? venta.createdAt;

  return (
    <div className="rp-modal-overlay" role="presentation" onClick={onCerrar}>
      <div
        className="rp-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detalle-venta-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rp-modal-header">
          <div>
            <h2 id="detalle-venta-title">Detalle de la venta</h2>
            <p>
              Mesa {venta.mesaNumero ?? "-"} · {venta.usuarioNombre}
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="rp-modal-close"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="rp-modal-datos">
          <div>
            <span>Fecha</span>
            <strong>{formatoFechaBogota(referencia)}</strong>
          </div>
          <div>
            <span>Hora</span>
            <strong>{formatoHoraBogota(referencia)}</strong>
          </div>
          <div>
            <span>Usuario</span>
            <strong>{venta.usuarioNombre}</strong>
          </div>
          <div>
            <span>Mesa</span>
            <strong>Mesa {venta.mesaNumero ?? "-"}</strong>
          </div>
        </div>

        <div className="rp-modal-productos">
          <h4>Productos de la venta</h4>

          {venta.productos.length === 0 ? (
            <div className="rp-modal-sin-productos">
              Esta venta no tiene productos registrados.
            </div>
          ) : (
            venta.productos.map((producto) => (
              <div key={producto.id} className="rp-producto-fila">
                <div>
                  <div className="rp-producto-nombre">
                    {producto.nombreProducto}
                  </div>
                  <div className="rp-producto-meta">
                    {formatoCOP(producto.precio)} × {producto.cantidad}
                  </div>
                </div>
                <div className="rp-producto-subtotal">
                  {formatoCOP(producto.subtotal)}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="rp-modal-footer">
          <span>Total</span>
          <strong>{formatoCOP(venta.total)}</strong>
        </div>
      </div>

      <style jsx>{`
        .rp-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(15, 17, 20, 0.55);
          backdrop-filter: blur(2px);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Helvetica, Arial, sans-serif;
        }
        .rp-modal {
          width: min(520px, 100%);
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 24px 60px -12px rgba(20, 24, 28, 0.35);
        }
        .rp-modal-header {
          flex-shrink: 0;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          padding: 22px 24px 18px;
          background: #14181c;
          color: #fff;
        }
        .rp-modal-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 650;
        }
        .rp-modal-header p {
          margin: 4px 0 0;
          font-size: 12.5px;
          color: rgba(255, 255, 255, 0.62);
        }
        .rp-modal-close {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border: none;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          cursor: pointer;
        }
        .rp-modal-close:hover {
          background: rgba(255, 255, 255, 0.16);
        }
        .rp-modal-datos {
          flex-shrink: 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          padding: 18px 24px;
          border-bottom: 1px solid #e4e7eb;
        }
        .rp-modal-datos div {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .rp-modal-datos span {
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.02em;
          color: #6b7280;
        }
        .rp-modal-datos strong {
          font-size: 14px;
          color: #14181c;
        }
        .rp-modal-productos {
          flex: 1 1 auto;
          overflow-y: auto;
          padding: 16px 24px 20px;
        }
        .rp-modal-productos h4 {
          margin: 0 0 12px;
          font-size: 12.5px;
          font-weight: 700;
          color: #6b7280;
        }
        .rp-modal-sin-productos {
          padding: 10px 0;
          font-size: 13px;
          color: #6b7280;
        }
        .rp-producto-fila {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 9px 0;
          border-bottom: 1px solid #e4e7eb;
        }
        .rp-producto-fila:last-child {
          border-bottom: none;
        }
        .rp-producto-nombre {
          font-size: 13.5px;
          font-weight: 600;
          color: #1f2430;
        }
        .rp-producto-meta {
          margin-top: 2px;
          font: 400 12px/1.4 ui-monospace, "SF Mono", "Roboto Mono", Menlo,
            Consolas, monospace;
          color: #6b7280;
        }
        .rp-producto-subtotal {
          flex-shrink: 0;
          font: 600 13.5px/1 ui-monospace, "SF Mono", "Roboto Mono", Menlo,
            Consolas, monospace;
          color: #0f5c2e;
        }
        .rp-modal-footer {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 24px;
          background: #14181c;
          color: #fff;
        }
        .rp-modal-footer span {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.03em;
          color: rgba(255, 255, 255, 0.65);
        }
        .rp-modal-footer strong {
          font: 700 22px/1 ui-monospace, "SF Mono", "Roboto Mono", Menlo,
            Consolas, monospace;
        }

        @media (max-width: 640px) {
          .rp-modal-overlay {
            align-items: flex-end;
            padding: 0;
          }
          .rp-modal {
            width: 100%;
            max-height: 90vh;
            border-radius: 20px 20px 0 0;
          }
          .rp-modal-datos {
            grid-template-columns: 1fr 1fr;
            padding: 16px;
          }
          .rp-modal-productos {
            padding: 14px 16px 16px;
          }
          .rp-modal-footer {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}