"use client";

import type {
  ResumenMetodoPago,
  ResumenPagosCombinados,
  ResumenCanalesPago,
} from "../../../types/reportes";
import { formatoCOP } from "../../../types/reportes";

import { TarjetaResumen } from "./ResumenReportes";

type Props = {
  resumenMetodosPago: ResumenMetodoPago[];
  resumenCombinados: ResumenPagosCombinados;
  resumenCanales: ResumenCanalesPago;
  cargando: boolean;
};

const INFO_METODO: Record<
  string,
  { icono: string; acento: string; titulo: string }
> = {
  efectivo: { icono: "💵", acento: "#157a3d", titulo: "Efectivo" },
  transferencia: { icono: "🏦", acento: "#2563eb", titulo: "Transferencia" },
  combinado: { icono: "🔄", acento: "#f5a524", titulo: "Combinado" },
};

export default function ResumenMetodosPago({
  resumenMetodosPago,
  resumenCombinados,
  resumenCanales,
  cargando,
}: Props) {
  // Ventas que no tienen método de pago registrado (cerradas
  // antes de que existiera esta funcionalidad). No es un error:
  // simplemente no se puede saber cómo se pagaron.
  const sinRegistrar =
    resumenCanales.totalVendido -
    resumenCanales.totalEfectivo -
    resumenCanales.totalTransferencia;

  const comprobacionCoincide = Math.round(sinRegistrar) === 0;

  return (
    <section className="rp-panel rp-metodos-panel">
      <div className="rp-panel-header">
        <h3>💳 Métodos de pago</h3>
        <p>Cómo se pagó cada venta y cuánto dinero entró por cada medio.</p>
      </div>

      {cargando ? (
        <div className="rp-metodos-grid">
          <div className="rp-metodo-skel" aria-hidden="true" />
          <div className="rp-metodo-skel" aria-hidden="true" />
          <div className="rp-metodo-skel" aria-hidden="true" />
        </div>
      ) : (
        <>
          <div className="rp-metodos-grid">
            {resumenMetodosPago.map((item) => {
              const info = INFO_METODO[item.metodo];
              return (
                <TarjetaResumen
                  key={item.metodo}
                  icono={info.icono}
                  acento={info.acento}
                  titulo={`${info.titulo} · ${item.cantidadVentas} ${
                    item.cantidadVentas === 1 ? "venta" : "ventas"
                  }`}
                  valor={formatoCOP(item.totalVendido)}
                />
              );
            })}
          </div>

          {resumenCombinados.cantidadVentas > 0 && (
            <div className="rp-combinado-box">
              <h4>Pagos combinados</h4>

              <div className="rp-combinado-fila">
                <span>Ventas combinadas</span>
                <span>{resumenCombinados.cantidadVentas}</span>
              </div>
              <div className="rp-combinado-fila">
                <span>Efectivo recibido</span>
                <span>{formatoCOP(resumenCombinados.totalEfectivo)}</span>
              </div>
              <div className="rp-combinado-fila">
                <span>Transferencias</span>
                <span>
                  {formatoCOP(resumenCombinados.totalTransferencia)}
                </span>
              </div>
              <div className="rp-combinado-fila rp-combinado-total">
                <span>Total ventas combinadas</span>
                <span>{formatoCOP(resumenCombinados.totalVendido)}</span>
              </div>
            </div>
          )}

          <div className="rp-canales-box">
            <h4>Resumen general de dinero</h4>

            <div className="rp-combinado-fila">
              <span>💵 Efectivo</span>
              <span>{formatoCOP(resumenCanales.totalEfectivo)}</span>
            </div>
            <div className="rp-combinado-fila">
              <span>🏦 Transferencias</span>
              <span>{formatoCOP(resumenCanales.totalTransferencia)}</span>
            </div>

            {!comprobacionCoincide && (
              <div className="rp-combinado-fila">
                <span>Sin registrar (ventas anteriores)</span>
                <span>{formatoCOP(sinRegistrar)}</span>
              </div>
            )}

            <div className="rp-combinado-fila rp-combinado-total">
              <span>Total vendido</span>
              <span>{formatoCOP(resumenCanales.totalVendido)}</span>
            </div>

            {comprobacionCoincide && (
              <p className="rp-comprobacion-ok">
                ✓ Efectivo + transferencias coincide con el total vendido.
              </p>
            )}
          </div>
        </>
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
        .rp-metodos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 18px;
        }
        .rp-metodo-skel {
          height: 108px;
          border-radius: 14px;
          background: linear-gradient(
            90deg,
            #f1f2f4 25%,
            #e9ebee 37%,
            #f1f2f4 63%
          );
          background-size: 400% 100%;
          animation: rp-shimmer-metodos 1.4s ease infinite;
        }
        @keyframes rp-shimmer-metodos {
          0% {
            background-position: 100% 0;
          }
          100% {
            background-position: -100% 0;
          }
        }
        .rp-combinado-box,
        .rp-canales-box {
          background: #f6f7f8;
          border: 1px solid #e4e7eb;
          border-radius: 12px;
          padding: 16px;
          margin-top: 14px;
        }
        .rp-combinado-box h4,
        .rp-canales-box h4 {
          margin: 0 0 10px;
          font-size: 13.5px;
          font-weight: 700;
          color: #14181c;
        }
        .rp-combinado-fila {
          display: flex;
          justify-content: space-between;
          font-size: 13.5px;
          color: #4b5563;
          padding: 4px 0;
        }
        .rp-combinado-total {
          font-weight: 700;
          color: #14181c;
          padding-top: 8px;
          margin-top: 4px;
          border-top: 1px dashed #d7dbe0;
        }
        .rp-comprobacion-ok {
          margin: 10px 0 0;
          font-size: 12.5px;
          color: #157a3d;
          font-weight: 600;
        }

        @media (max-width: 480px) {
          .rp-panel {
            padding: 18px;
          }
        }
      `}</style>
    </section>
  );
}
