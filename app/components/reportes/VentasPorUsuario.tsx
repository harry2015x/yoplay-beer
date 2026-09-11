"use client";

import type { VentasPorUsuarioReporte } from "../../../types/reportes";
import { formatoCOP } from "../../../types/reportes";

type Props = {
  ventasPorUsuario: VentasPorUsuarioReporte[];
  cargando: boolean;
};

function inicialesDeNombre(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[1][0]).toUpperCase();
}

export default function VentasPorUsuario({
  ventasPorUsuario,
  cargando,
}: Props) {
  return (
    <section className="rp-panel">
      <div className="rp-panel-header">
        <h3>👥 Ventas por usuario</h3>
        <p>Cantidad de ventas y total vendido por cada usuario en el periodo.</p>
      </div>

      {cargando && <div className="rp-loading">Cargando reportes...</div>}

      {!cargando && ventasPorUsuario.length === 0 && (
        <div className="rp-empty">
          <span>No se encontraron ventas en este periodo.</span>
        </div>
      )}

      {!cargando && ventasPorUsuario.length > 0 && (
        <div className="rp-lista-usuarios">
          {ventasPorUsuario.map((usuario) => (
            <div
              key={usuario.usuarioId ?? "sin-usuario"}
              className="rp-usuario-row"
            >
              <span className="rp-usuario-avatar">
                {inicialesDeNombre(usuario.usuarioNombre)}
              </span>

              <span className="rp-usuario-info">
                <strong>{usuario.usuarioNombre}</strong>
                <span className="rp-usuario-meta">
                  {usuario.cantidadVentas}{" "}
                  {usuario.cantidadVentas === 1 ? "venta" : "ventas"}
                </span>
              </span>

              <span className="rp-usuario-total">
                {formatoCOP(usuario.totalVendido)}
              </span>
            </div>
          ))}
        </div>
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
        .rp-lista-usuarios {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .rp-usuario-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 14px;
          background: #f6f7f8;
          border: 1px solid #e4e7eb;
          border-radius: 12px;
        }
        .rp-usuario-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #fff;
          border: 1px solid #e4e7eb;
          font: 700 12.5px/1 ui-monospace, "SF Mono", "Roboto Mono", Menlo,
            Consolas, monospace;
          color: #14181c;
        }
        .rp-usuario-info {
          flex: 1 1 auto;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .rp-usuario-info strong {
          font-size: 14px;
          color: #14181c;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .rp-usuario-meta {
          font-size: 12px;
          color: #6b7280;
        }
        .rp-usuario-total {
          flex-shrink: 0;
          font: 700 14.5px/1 ui-monospace, "SF Mono", "Roboto Mono", Menlo,
            Consolas, monospace;
          color: #0f5c2e;
        }

        @media (max-width: 480px) {
          .rp-panel {
            padding: 18px;
          }
          .rp-usuario-row {
            padding: 10px;
            gap: 10px;
          }
        }
      `}</style>
    </section>
  );
}