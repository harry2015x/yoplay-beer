"use client";

import type { ProductoMasVendido } from "../../../types/reportes";
import { formatoCOP } from "../../../types/reportes";

type Props = {
  productos: ProductoMasVendido[];
  cargando: boolean;
};

export default function ProductosMasVendidos({ productos, cargando }: Props) {
  return (
    <section className="rp-panel">
      <div className="rp-panel-header">
        <h3>🏆 Productos más vendidos</h3>
        <p>Ordenados por cantidad vendida en el periodo seleccionado.</p>
      </div>

      {cargando && <div className="rp-loading">Cargando reportes...</div>}

      {!cargando && productos.length === 0 && (
        <div className="rp-empty">
          <span>No se encontraron ventas en este periodo.</span>
        </div>
      )}

      {!cargando && productos.length > 0 && (
        <ol className="rp-lista-productos">
          {productos.map((producto, indice) => (
            <li
              key={producto.productoId ?? producto.nombreProducto}
              className="rp-producto-row"
            >
              <span className="rp-producto-posicion">{indice + 1}</span>

              <span className="rp-producto-info">
                <strong>{producto.nombreProducto}</strong>
                <span className="rp-producto-meta">
                  Cantidad vendida: {producto.cantidadVendida}
                </span>
              </span>

              <span className="rp-producto-total">
                {formatoCOP(producto.totalGenerado)}
              </span>
            </li>
          ))}
        </ol>
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
        .rp-lista-productos {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .rp-producto-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 14px;
          background: #f6f7f8;
          border: 1px solid #e4e7eb;
          border-radius: 12px;
        }
        .rp-producto-posicion {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #fff;
          border: 1px solid #e4e7eb;
          font: 700 12.5px/1 ui-monospace, "SF Mono", "Roboto Mono", Menlo,
            Consolas, monospace;
          color: #14181c;
        }
        .rp-producto-info {
          flex: 1 1 auto;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .rp-producto-info strong {
          font-size: 14px;
          color: #14181c;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .rp-producto-meta {
          font-size: 12px;
          color: #6b7280;
        }
        .rp-producto-total {
          flex-shrink: 0;
          font: 700 14.5px/1 ui-monospace, "SF Mono", "Roboto Mono", Menlo,
            Consolas, monospace;
          color: #0f5c2e;
        }

        @media (max-width: 480px) {
          .rp-panel {
            padding: 18px;
          }
          .rp-producto-row {
            padding: 10px;
            gap: 10px;
          }
        }
      `}</style>
    </section>
  );
}