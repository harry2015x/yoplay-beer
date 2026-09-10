"use client";

import { useEffect, useState } from "react";

import type { VentaDetalle, ProductoVenta } from "../../../types/ventas";

// ============================================================
// TIPO DEL RESUMEN
// ============================================================

export type ResumenVentasUsuario = {
  usuarioId: string | null;
  usuarioNombre: string;
  cantidadVentas: number;
  totalVentas: number;
  ventas: VentaDetalle[];
};

type Props = {
  resumen: ResumenVentasUsuario;
  onCerrar: () => void;
};

// ============================================================
// FORMATO Y TEXTO
// ============================================================

function formatoCOP(valor: number): string {
  return valor.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatoHora(fecha: string | Date | null | undefined): string {
  if (!fecha) return "--:--";

  const fechaObjeto = fecha instanceof Date ? fecha : new Date(fecha);
  if (Number.isNaN(fechaObjeto.getTime())) return "--:--";

  return fechaObjeto.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function capitalizarNombre(nombre: string): string {
  return nombre
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(" ");
}

function etiquetaVentas(cantidad: number): string {
  return cantidad === 1 ? "venta realizada" : "ventas realizadas";
}

// ============================================================
// ICONOS (SVG en línea, sin dependencias)
// ============================================================

function IconClock() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="7.25" />
      <path d="M10 6.2v3.8l2.6 1.5" />
    </svg>
  );
}

function IconReceipt() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3h10v14l-1.9-1.3-1.7 1.3-1.7-1.3-1.7 1.3-1.7-1.3L5 17V3z" />
      <path d="M7.3 7.2h5.4M7.3 10.2h5.4" />
    </svg>
  );
}

function IconAlertTriangle() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3.4 17.3 16H2.7L10 3.4z" />
      <path d="M10 8.3v3" />
      <circle cx="10" cy="13.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconInbox() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.6 5 3.6h10l2 5" />
      <path d="M3 8.6h4.1c.3 1 1.1 1.7 2.4 1.7s2.1-.7 2.4-1.7H17" />
      <path d="M3 8.6v6.3c0 .6.45 1 1 1h12c.55 0 1-.4 1-1V8.6" />
    </svg>
  );
}

function IconX() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M5 5l10 10M15 5 5 15" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 7.5 10 12.5 15 7.5" />
    </svg>
  );
}

// ============================================================
// COMPONENTE
// ============================================================

export default function VentasUsuarioModal({ resumen, onCerrar }: Props) {
  const [ventaSeleccionada, setVentaSeleccionada] = useState<number | null>(null);

  const seleccionarVenta = (ventaId: number) => {
    setVentaSeleccionada((actual) => (actual === ventaId ? null : ventaId));
  };

  // Cerrar con Escape
  useEffect(() => {
    function onKeyDown(evento: KeyboardEvent) {
      if (evento.key === "Escape") onCerrar();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCerrar]);

  return (
    <div className="ventas-modal-overlay" role="presentation" onClick={onCerrar}>
      <div
        className="ventas-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ventas-modal-title"
        onClick={(evento) => evento.stopPropagation()}
      >
        {/* HEADER */}
        <div className="ventas-modal-header">
          <div className="vm-header-info">
            <h2 id="ventas-modal-title">Ventas de {capitalizarNombre(resumen.usuarioNombre)}</h2>
            <p>
              {resumen.cantidadVentas} {etiquetaVentas(resumen.cantidadVentas)}
            </p>
          </div>

          <button type="button" onClick={onCerrar} className="ventas-modal-close" aria-label="Cerrar">
            <IconX />
          </button>
        </div>

        {/* INSTRUCCIÓN */}
        {resumen.ventas.length > 0 && (
          <div className="vm-hint">Selecciona una venta para ver el detalle de productos.</div>
        )}

        {/* LISTA DE VENTAS */}
        <div className="ventas-lista">
          {resumen.ventas.length === 0 ? (
            <div className="ventas-vacias">
              <IconInbox />
              <span>No hay ventas registradas para este usuario.</span>
            </div>
          ) : (
            resumen.ventas.map((venta: VentaDetalle) => {
              const estaAbierta = ventaSeleccionada === venta.id;

              return (
                <div className="venta-card" key={venta.id}>
                  <button
                    type="button"
                    className="venta-item"
                    aria-expanded={estaAbierta}
                    aria-controls={`detalle-venta-${venta.id}`}
                    onClick={() => seleccionarVenta(venta.id)}
                  >
                    <span className="venta-hora">
                      <IconClock />
                      {formatoHora(venta.closedAt ?? venta.createdAt)}
                    </span>

                    <span className="venta-mesa">Mesa {venta.mesaNumero ?? "-"}</span>

                    <span className="venta-total">{formatoCOP(venta.total)}</span>

                    <span className={`venta-chevron${estaAbierta ? " abierto" : ""}`} aria-hidden="true">
                      <IconChevronDown />
                    </span>
                  </button>

                  <div id={`detalle-venta-${venta.id}`} className={`venta-detalle${estaAbierta ? " abierto" : ""}`}>
                    <div className="venta-detalle-inner">
                      <div className="venta-detalle-content">
                        <div className="detalle-titulo">
                          <IconReceipt />
                          <span>Productos de la venta</span>
                        </div>

                        {venta.productos.length === 0 ? (
                          <div className="detalle-vacio">
                            <IconAlertTriangle />
                            <span>Esta venta no tiene productos registrados.</span>
                          </div>
                        ) : (
                          venta.productos.map((producto: ProductoVenta) => (
                            <div key={producto.id} className="producto-row">
                              <div>
                                <div className="producto-nombre">{producto.nombreProducto}</div>
                                <div className="producto-meta">
                                  {formatoCOP(producto.precio)} × {producto.cantidad}
                                </div>
                              </div>
                              <div className="producto-subtotal">{formatoCOP(producto.subtotal)}</div>
                            </div>
                          ))
                        )}

                        <div className="detalle-total">
                          <span>Total de la venta</span>
                          <span>{formatoCOP(venta.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        <div className="ventas-modal-footer">
          <div>
            <span className="vm-footer-label">Total del usuario</span>
            <small className="vm-footer-count">
              {resumen.cantidadVentas} {etiquetaVentas(resumen.cantidadVentas)}
            </small>
          </div>
          <strong className="vm-footer-total">{formatoCOP(resumen.totalVentas)}</strong>
        </div>
      </div>

      <style jsx>{`
        .ventas-modal-overlay {
          --vm-ink: #14181c;
          --vm-surface: #ffffff;
          --vm-surface-muted: #f6f7f8;
          --vm-border: #e4e7eb;
          --vm-text: #1f2430;
          --vm-text-muted: #6b7280;
          --vm-green: #157a3d;
          --vm-green-deep: #0f5c2e;
          --vm-mono: ui-monospace, "SF Mono", "Roboto Mono", "Cascadia Code", Menlo, Consolas, monospace;

          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(15, 17, 20, 0.55);
          backdrop-filter: blur(2px);
          animation: vm-fade 0.18s ease;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        .ventas-modal {
          width: min(560px, 100%);
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          background: var(--vm-surface);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 24px 60px -12px rgba(20, 24, 28, 0.35), 0 2px 8px rgba(20, 24, 28, 0.08);
          animation: vm-rise 0.22s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        @keyframes vm-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes vm-rise {
          from { opacity: 0; transform: translateY(18px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .ventas-modal-header {
          flex-shrink: 0;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          padding: 22px 24px 20px;
          background: var(--vm-ink);
          color: #fff;
        }

        .vm-header-info h2 {
          margin: 0;
          font-size: 19px;
          font-weight: 650;
          letter-spacing: -0.01em;
        }

        .vm-header-info p {
          margin: 4px 0 0;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.62);
        }

        .ventas-modal-close {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.85);
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .ventas-modal-close svg { width: 15px; height: 15px; }
        .ventas-modal-close:hover { background: rgba(255, 255, 255, 0.16); color: #fff; }
        .ventas-modal-close:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }

        .vm-hint {
          flex-shrink: 0;
          padding: 12px 24px;
          font-size: 12.5px;
          color: var(--vm-text-muted);
          background: var(--vm-surface-muted);
          border-bottom: 1px solid var(--vm-border);
        }

        .ventas-lista {
          flex: 1 1 auto;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: var(--vm-border) transparent;
        }
        .ventas-lista::-webkit-scrollbar { width: 8px; }
        .ventas-lista::-webkit-scrollbar-thumb { background: var(--vm-border); border-radius: 8px; }

        .ventas-vacias {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 48px 24px;
          color: var(--vm-text-muted);
          text-align: center;
          font-size: 14px;
        }
        .ventas-vacias svg { width: 30px; height: 30px; opacity: 0.5; }

        .venta-card { border-bottom: 1px solid var(--vm-border); }
        .venta-card:last-child { border-bottom: none; }

        .venta-item {
          all: unset;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          padding: 14px 24px;
          cursor: pointer;
          transition: background 0.12s ease;
        }
        .venta-item:hover { background: var(--vm-surface-muted); }
        .venta-item:focus-visible { outline: 2px solid var(--vm-green); outline-offset: -2px; background: var(--vm-surface-muted); }

        .venta-hora {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
          width: 66px;
          font: 500 12.5px/1 var(--vm-mono);
          color: var(--vm-text-muted);
        }
        .venta-hora svg { width: 14px; height: 14px; flex-shrink: 0; }

        .venta-mesa {
          flex-shrink: 0;
          padding: 3px 10px;
          font-size: 13px;
          font-weight: 600;
          color: var(--vm-text);
          background: var(--vm-surface-muted);
          border: 1px solid var(--vm-border);
          border-radius: 100px;
          white-space: nowrap;
        }

        .venta-total {
          margin-left: auto;
          font: 600 14.5px/1 var(--vm-mono);
          color: var(--vm-ink);
        }

        .venta-chevron {
          display: flex;
          flex-shrink: 0;
          color: var(--vm-text-muted);
          transition: transform 0.22s ease, color 0.22s ease;
        }
        .venta-chevron svg { width: 16px; height: 16px; }
        .venta-chevron.abierto { transform: rotate(180deg); color: var(--vm-green); }

        .venta-detalle {
          display: grid;
          grid-template-rows: 0fr;
          background: var(--vm-surface-muted);
          transition: grid-template-rows 0.25s ease;
        }
        .venta-detalle.abierto { grid-template-rows: 1fr; }
        .venta-detalle-inner { overflow: hidden; }
        .venta-detalle-content { padding: 4px 24px 20px; }

        .detalle-titulo {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 12px 0 10px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.02em;
          color: var(--vm-text-muted);
        }
        .detalle-titulo svg { width: 14px; height: 14px; }

        .detalle-vacio {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 0;
          font-size: 13px;
          color: var(--vm-text-muted);
        }
        .detalle-vacio svg { width: 15px; height: 15px; flex-shrink: 0; color: #b45309; }

        .producto-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 9px 0;
          border-bottom: 1px solid var(--vm-border);
        }
        .producto-row:last-of-type { border-bottom: none; }
        .producto-nombre { font-size: 13.5px; font-weight: 600; color: var(--vm-text); }
        .producto-meta { margin-top: 2px; font: 400 12px/1.4 var(--vm-mono); color: var(--vm-text-muted); }
        .producto-subtotal { flex-shrink: 0; font: 600 13.5px/1 var(--vm-mono); color: var(--vm-green-deep); }

        .detalle-total {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1.5px solid var(--vm-border);
        }
        .detalle-total span:first-child { font-size: 12px; font-weight: 700; letter-spacing: 0.03em; color: var(--vm-text-muted); }
        .detalle-total span:last-child { font: 700 16px/1 var(--vm-mono); color: var(--vm-green-deep); }

        .ventas-modal-footer {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 18px 24px;
          background: var(--vm-ink);
          color: #fff;
        }
        .vm-footer-label { font-size: 12px; font-weight: 600; letter-spacing: 0.03em; color: rgba(255, 255, 255, 0.65); }
        .vm-footer-count { display: block; margin-top: 3px; font-size: 12px; color: rgba(255, 255, 255, 0.5); }
        .vm-footer-total { font: 700 22px/1 var(--vm-mono); letter-spacing: -0.01em; color: #fff; }

        /* Responsive: hoja inferior en móvil */
        @media (max-width: 640px) {
          .ventas-modal-overlay { align-items: flex-end; padding: 0; }
          .ventas-modal { width: 100%; max-height: 90vh; border-radius: 20px 20px 0 0; }
        }

        @media (max-width: 380px) {
          .ventas-modal-header { padding: 18px 16px 16px; }
          .vm-hint { padding: 10px 16px; }
          .venta-item { padding: 12px 16px; gap: 10px; }
          .venta-detalle-content { padding: 4px 16px 16px; }
          .ventas-modal-footer { padding: 16px; }
          .venta-hora { width: 56px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ventas-modal-overlay,
          .ventas-modal,
          .venta-detalle,
          .venta-chevron {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
