"use client";

import type { DatosGrafico } from "../../../types/reportes";
import { formatoCOP } from "../../../types/reportes";

type Props = {
  datos: DatosGrafico;
  cargando: boolean;
};

export default function GraficoVentas({ datos, cargando }: Props) {
  const maximo = datos.reduce((max, punto) => Math.max(max, punto.total), 0);

  return (
    <section className="rp-panel">
      <div className="rp-panel-header">
        <h3>📈 Ventas por día</h3>
        <p>Total vendido por cada día dentro del periodo seleccionado.</p>
      </div>

      {cargando && <div className="rp-loading">Cargando reportes...</div>}

      {!cargando && datos.length === 0 && (
        <div className="rp-empty">
          <span>No se encontraron ventas en este periodo.</span>
        </div>
      )}

      {!cargando && datos.length > 0 && (
        <div className="rp-grafico-scroll">
          <div className="rp-grafico">
            {datos.map((punto) => {
              const alturaPct =
                maximo > 0 ? Math.max((punto.total / maximo) * 100, 2) : 2;

              return (
                <div
                  key={punto.fecha}
                  className="rp-barra-col"
                  title={`${punto.etiqueta}: ${formatoCOP(punto.total)}`}
                >
                  <div className="rp-barra-valor">
                    {formatoCOP(punto.total)}
                  </div>
                  <div className="rp-barra" style={{ height: `${alturaPct}%` }} />
                  <div className="rp-barra-etiqueta">{punto.etiqueta}</div>
                </div>
              );
            })}
          </div>
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
        .rp-grafico-scroll {
          overflow-x: auto;
        }
        .rp-grafico {
          display: flex;
          align-items: flex-end;
          gap: 14px;
          min-width: max-content;
          height: 220px;
          padding: 0 4px;
        }
        .rp-barra-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          width: 48px;
          height: 100%;
          flex-shrink: 0;
        }
        .rp-barra-valor {
          font: 600 10.5px/1.2 ui-monospace, "SF Mono", "Roboto Mono", Menlo,
            Consolas, monospace;
          color: #6b7280;
          margin-bottom: 6px;
          white-space: nowrap;
        }
        .rp-barra {
          width: 100%;
          min-height: 4px;
          border-radius: 6px 6px 0 0;
          background: linear-gradient(180deg, #22a35a, #157a3d);
          transition: height 0.3s ease;
        }
        .rp-barra-etiqueta {
          margin-top: 8px;
          font-size: 11.5px;
          color: #6b7280;
          text-transform: capitalize;
          white-space: nowrap;
        }

        @media (max-width: 480px) {
          .rp-panel {
            padding: 18px;
          }
          .rp-grafico {
            height: 180px;
            gap: 10px;
          }
          .rp-barra-col {
            width: 40px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .rp-barra {
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}