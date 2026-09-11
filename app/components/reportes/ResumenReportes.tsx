"use client";

import type { ResumenReporte } from "../../../types/reportes";
import { formatoCOP } from "../../../types/reportes";

type Props = {
  resumen: ResumenReporte;
  cargando: boolean;
};

export default function ResumenReportes({ resumen, cargando }: Props) {
  const promedioTexto =
    resumen.cantidadVentas > 0 ? formatoCOP(resumen.promedioPorVenta) : "—";

  return (
    <div className="rp-resumen-grid">
      {cargando ? (
        <>
          <TarjetaSkeleton />
          <TarjetaSkeleton />
          <TarjetaSkeleton />
          <TarjetaSkeleton />
        </>
      ) : (
        <>
          <TarjetaResumen
            icono="💰"
            acento="#157a3d"
            titulo="Total vendido"
            valor={formatoCOP(resumen.totalVendido)}
          />
          <TarjetaResumen
            icono="🧾"
            acento="#0f5c2e"
            titulo="Ventas realizadas"
            valor={String(resumen.cantidadVentas)}
          />
          <TarjetaResumen
            icono="🍺"
            acento="#f5a524"
            titulo="Productos vendidos"
            valor={String(resumen.productosVendidos)}
          />
          <TarjetaResumen
            icono="📈"
            acento="#2563eb"
            titulo="Promedio por venta"
            valor={promedioTexto}
          />
        </>
      )}

      <style jsx>{`
        .rp-resumen-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }
      `}</style>
    </div>
  );
}

function TarjetaResumen({
  icono,
  titulo,
  valor,
  acento,
}: {
  icono: string;
  titulo: string;
  valor: string;
  acento: string;
}) {
  return (
    <div className="rp-card">
      <div
        className="rp-card-icono"
        style={{ background: `${acento}1a`, color: acento }}
      >
        {icono}
      </div>
      <p className="rp-card-titulo">{titulo}</p>
      <h3 className="rp-card-valor">{valor}</h3>

      <style jsx>{`
        .rp-card {
          background: #fff;
          border: 1px solid #e4e7eb;
          border-radius: 14px;
          padding: 20px;
          box-shadow: 0 1px 2px rgba(20, 24, 28, 0.04);
        }
        .rp-card-icono {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          font-size: 19px;
          margin-bottom: 12px;
        }
        .rp-card-titulo {
          margin: 0 0 4px;
          font-size: 13px;
          color: #6b7280;
        }
        .rp-card-valor {
          margin: 0;
          font: 700 21px/1.2 ui-monospace, "SF Mono", "Roboto Mono", Menlo,
            Consolas, monospace;
          color: #14181c;
          word-break: break-word;
        }
      `}</style>
    </div>
  );
}

function TarjetaSkeleton() {
  return (
    <div className="rp-card-skel" aria-hidden="true">
      <style jsx>{`
        .rp-card-skel {
          height: 108px;
          border-radius: 14px;
          background: linear-gradient(
            90deg,
            #f1f2f4 25%,
            #e9ebee 37%,
            #f1f2f4 63%
          );
          background-size: 400% 100%;
          animation: rp-shimmer 1.4s ease infinite;
        }
        @keyframes rp-shimmer {
          0% {
            background-position: 100% 0;
          }
          100% {
            background-position: -100% 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .rp-card-skel {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}