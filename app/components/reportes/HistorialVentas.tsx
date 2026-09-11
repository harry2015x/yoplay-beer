"use client";

import { useState } from "react";

import type { VentaHistorial } from "../../../types/reportes";
import { formatoCOP } from "../../../types/reportes";

import DetalleVentaModal from "./DetalleVentaModal";

type Props = {
  ventas: VentaHistorial[];
  cargando: boolean;
  error: string | null;
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

export default function HistorialVentas({ ventas, cargando, error }: Props) {
  const [ventaSeleccionada, setVentaSeleccionada] =
    useState<VentaHistorial | null>(null);

  return (
    <section className="rp-panel">
      <div className="rp-panel-header">
        <h3>📋 Historial de ventas</h3>
        <p>
          Todas las ventas cerradas del periodo, de la más reciente a la más
          antigua.
        </p>
      </div>

      {cargando && <div className="rp-loading">Cargando reportes...</div>}

      {!cargando && error && (
        <div className="rp-error">No fue posible cargar los reportes.</div>
      )}

      {!cargando && !error && ventas.length === 0 && (
        <div className="rp-empty">
          <span>No se encontraron ventas en este periodo.</span>
        </div>
      )}

      {!cargando && !error && ventas.length > 0 && (
        <div className="rp-tabla-wrap">
          <table className="rp-tabla">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Usuario</th>
                <th>Mesa</th>
                <th className="rp-col-total">Total</th>
                <th aria-hidden="true"></th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((venta) => {
                const referencia = venta.closedAt ?? venta.createdAt;
                return (
                  <tr key={venta.id}>
                    <td>{formatoFechaBogota(referencia)}</td>
                    <td>{formatoHoraBogota(referencia)}</td>
                    <td>{venta.usuarioNombre}</td>
                    <td>Mesa {venta.mesaNumero ?? "-"}</td>
                    <td className="rp-col-total">{formatoCOP(venta.total)}</td>
                    <td>
                      <button
                        type="button"
                        className="rp-ver-detalle"
                        onClick={() => setVentaSeleccionada(venta)}
                      >
                        Ver detalle →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {ventaSeleccionada && (
        <DetalleVentaModal
          venta={ventaSeleccionada}
          onCerrar={() => setVentaSeleccionada(null)}
        />
      )}

      <style jsx>{`
        .rp-panel {
          background: #fff;
          border: 1px solid #e4e7eb;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 1px 2px rgba(20, 24, 28, 0.04);
        }
        .rp-panel-header h3 {
          margin: 0 0 6px;
          font-size: 16.5px;
          font-weight: 650;
          color: #14181c;
        }
        .rp-panel-header p {
          margin: 0 0 18px;
          font-size: 13px;
          color: #6b7280;
        }
        .rp-loading,
        .rp-empty {
          padding: 32px 12px;
          text-align: center;
          color: #6b7280;
          font-size: 13.5px;
        }
        .rp-error {
          padding: 16px;
          background: #fdf0ef;
          border: 1px solid #f6d2ce;
          border-radius: 10px;
          color: #8a2a22;
          font-size: 13.5px;
        }
        .rp-tabla-wrap {
          overflow-x: auto;
        }
        .rp-tabla {
          width: 100%;
          border-collapse: collapse;
          font-size: 13.5px;
        }
        .rp-tabla th {
          text-align: left;
          padding: 10px 12px;
          font-size: 12px;
          font-weight: 700;
          color: #6b7280;
          border-bottom: 1.5px solid #e4e7eb;
          white-space: nowrap;
        }
        .rp-tabla td {
          padding: 12px;
          border-bottom: 1px solid #e4e7eb;
          color: #1f2430;
          white-space: nowrap;
        }
        .rp-tabla tbody tr:last-child td {
          border-bottom: none;
        }
        .rp-col-total {
          text-align: right;
          font: 700 13.5px/1 ui-monospace, "SF Mono", "Roboto Mono", Menlo,
            Consolas, monospace;
          color: #0f5c2e;
        }
        .rp-ver-detalle {
          border: none;
          background: transparent;
          color: #157a3d;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
        }
        .rp-ver-detalle:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .rp-panel {
            padding: 18px;
          }
          .rp-tabla th,
          .rp-tabla td {
            padding: 10px 8px;
          }
        }
      `}</style>
    </section>
  );
}