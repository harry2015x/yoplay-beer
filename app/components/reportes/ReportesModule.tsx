"use client";

import { useReportes } from "../../../hooks/useReportes";

import FiltrosReportes from "./FiltrosReportes";
import ResumenReportes from "./ResumenReportes";
import GraficoVentas from "./GraficoVentas";
import ProductosMasVendidos from "./ProductosMasVendidos";
import VentasPorUsuario from "./VentasPorUsuario";
import HistorialVentas from "./HistorialVentas";

export default function ReportesModule() {
  const {
    periodo,
    fechaInicio,
    fechaFin,
    resumen,
    productosMasVendidos,
    ventasPorUsuario,
    historialVentas,
    datosGrafico,
    cargando,
    error,
    cambiarPeriodo,
    aplicarRangoPersonalizado,
    recargar,
    limpiarError,
  } = useReportes();

  return (
    <div className="reportes-module">
      <div className="rp-page-header">
        <div>
          <h2>📊 Reportes</h2>
          <p>
            Analiza el rendimiento de las ventas y consulta el historial del
            negocio.
          </p>
        </div>

        <button
          type="button"
          onClick={recargar}
          disabled={cargando}
          className="rp-refresh-btn"
        >
          {cargando ? "Cargando..." : "Actualizar"}
        </button>
      </div>

      {error && (
        <div className="rp-error-banner" role="alert">
          <span>{error}</span>
          <button type="button" onClick={limpiarError} aria-label="Cerrar aviso">
            ✕
          </button>
        </div>
      )}

      <FiltrosReportes
        periodo={periodo}
        fechaInicio={fechaInicio}
        fechaFin={fechaFin}
        cargando={cargando}
        onCambiarPeriodo={cambiarPeriodo}
        onAplicarPersonalizado={aplicarRangoPersonalizado}
      />

      <ResumenReportes resumen={resumen} cargando={cargando} />

      <GraficoVentas datos={datosGrafico} cargando={cargando} />

      <div className="rp-grid-dos">
        <ProductosMasVendidos
          productos={productosMasVendidos}
          cargando={cargando}
        />
        <VentasPorUsuario
          ventasPorUsuario={ventasPorUsuario}
          cargando={cargando}
        />
      </div>

      <HistorialVentas
        ventas={historialVentas}
        cargando={cargando}
        error={error}
      />

      <style jsx>{`
        .reportes-module {
          display: flex;
          flex-direction: column;
          gap: 22px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Helvetica, Arial, sans-serif;
          color: #1f2430;
        }
        .rp-page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .rp-page-header h2 {
          margin: 0 0 4px;
          font-size: 22px;
          font-weight: 650;
          letter-spacing: -0.01em;
          color: #14181c;
        }
        .rp-page-header p {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
        }
        .rp-refresh-btn {
          padding: 11px 18px;
          border: none;
          border-radius: 10px;
          background: #14181c;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
        .rp-refresh-btn:hover:not(:disabled) {
          background: #20262d;
        }
        .rp-refresh-btn:disabled {
          background: #9aa3ad;
          cursor: not-allowed;
        }
        .rp-error-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 16px;
          background: #fdf0ef;
          border: 1px solid #f6d2ce;
          border-left: 3px solid #c0362c;
          border-radius: 10px;
          color: #8a2a22;
          font-size: 13.5px;
        }
        .rp-error-banner button {
          border: none;
          background: transparent;
          color: #8a2a22;
          cursor: pointer;
          font-size: 14px;
        }
        .rp-grid-dos {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 20px;
        }

        @media (max-width: 640px) {
          .rp-page-header {
            flex-direction: column;
            align-items: stretch;
          }
          .rp-refresh-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}