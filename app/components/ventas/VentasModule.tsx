"use client";

import { useMemo, useState, type ChangeEvent } from "react";

import type { PerfilUsuario } from "../../../hooks/useAuth";

import type { ResumenVentasUsuario, VentaDetalle } from "../../../types/ventas";

import { obtenerVentasPorFecha } from "../../../hooks/useVentas";

import { generarReporteVentasPDF } from "../../../lib/generarReporteVentasPDF";

import VentasUsuarioModal from "./VentasUsuarioModal";

// ============================================================
// PROPS
// ============================================================

type Props = {
  ventas: VentaDetalle[];
  resumenUsuarios: ResumenVentasUsuario[];
  cargando: boolean;
  error: string | null;
  cargarVentas: () => Promise<void>;
  limpiarError: () => void;
  perfilActual: PerfilUsuario;
  esAdministrador: boolean;
};

// ============================================================
// FORMATO Y TEXTO
// ============================================================

function formatoCOP(valor: number): string {
  return Number(valor || 0).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function etiquetaVentas(cantidad: number, singular: string, plural: string): string {
  return cantidad === 1 ? singular : plural;
}

// ============================================================
// FECHA LOCAL (para el selector de fecha del reporte PDF)
// ============================================================

function fechaLocalDeHoy(): Date {
  const ahora = new Date();
  return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
}

function fechaAValorInput(fecha: Date): string {
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, "0");
  const dd = String(fecha.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function valorInputAFechaLocal(valor: string): Date | null {
  const partes = valor.split("-").map(Number);
  const [yyyy, mm, dd] = partes;
  if (!yyyy || !mm || !dd) return null;
  return new Date(yyyy, mm - 1, dd);
}

function inicialesDeNombre(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[1][0]).toUpperCase();
}

// ============================================================
// ICONOS (SVG en línea, sin dependencias)
// ============================================================

type IconProps = { size?: number };

function IconRefresh({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 8.5A7 7 0 0 0 4.2 5.8L2.5 7.5" />
      <path d="M2.5 3.5v4h4" />
      <path d="M3 11.5A7 7 0 0 0 15.8 14.2l1.7-1.7" />
      <path d="M17.5 16.5v-4h-4" />
    </svg>
  );
}

function IconSpinner({ size = 16 }: IconProps) {
  return (
    <svg className="vm-spin" width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="10" cy="10" r="7.5" opacity="0.25" />
      <path d="M17.5 10a7.5 7.5 0 0 0-7.5-7.5" />
    </svg>
  );
}

function IconAlertTriangle({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3.4 17.3 16H2.7L10 3.4z" />
      <path d="M10 8.3v3" />
      <circle cx="10" cy="13.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconX({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M5 5l10 10M15 5 5 15" />
    </svg>
  );
}

function IconChevronRight({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.5 5 12.5 10 7.5 15" />
    </svg>
  );
}

function IconFileDown({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2.5h5.5L15 6v10.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1z" />
      <path d="M11.3 2.5V6h3.5" />
      <path d="M10 9v5.2" />
      <path d="M7.6 12.3 10 14.7l2.4-2.4" />
    </svg>
  );
}

function IconTray({ size = 30 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.6 5 3.6h10l2 5" />
      <path d="M3 8.6h4.1c.3 1 1.1 1.7 2.4 1.7s2.1-.7 2.4-1.7H17" />
      <path d="M3 8.6v6.3c0 .6.45 1 1 1h12c.55 0 1-.4 1-1V8.6" />
    </svg>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function VentasModule({
  ventas,
  resumenUsuarios,
  cargando,
  error,
  cargarVentas,
  limpiarError,
  perfilActual,
  esAdministrador,
}: Props) {
  // ==========================================================
  // USUARIO SELECCIONADO
  // ==========================================================

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<ResumenVentasUsuario | null>(null);

  // ==========================================================
  // FILTRAR VENTAS
  //
  // ADMINISTRADOR: ve todas las ventas.
  // VENDEDOR: solo ve sus propias ventas.
  // ==========================================================

  const ventasVisibles = useMemo(() => {
    if (esAdministrador) return ventas;
    return ventas.filter((venta) => venta.usuarioId === perfilActual.id);
  }, [ventas, esAdministrador, perfilActual.id]);

  // ==========================================================
  // RESUMEN DE USUARIOS VISIBLE
  // ==========================================================

  const resumenVisible = useMemo(() => {
    if (esAdministrador) return resumenUsuarios;
    return resumenUsuarios.filter((resumen) => resumen.usuarioId === perfilActual.id);
  }, [resumenUsuarios, esAdministrador, perfilActual.id]);

  // ==========================================================
  // TOTAL DEL DÍA
  // ==========================================================

  const totalDelDia = useMemo(() => {
    return ventasVisibles.reduce((total, venta) => total + Number(venta.total || 0), 0);
  }, [ventasVisibles]);

  // ==========================================================
  // CANTIDAD DE VENTAS
  // ==========================================================

  const cantidadVentas = ventasVisibles.length;

  // ==========================================================
  // RECARGAR
  // ==========================================================

  async function manejarRecargar() {
    await cargarVentas();
  }

  // ==========================================================
  // EXPORTAR PDF
  // ==========================================================

  const [fechaReporte, setFechaReporte] = useState<Date>(() => fechaLocalDeHoy());
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [mensajePDF, setMensajePDF] = useState<string | null>(null);

  function manejarCambioFecha(evento: ChangeEvent<HTMLInputElement>) {
    const nuevaFecha = valorInputAFechaLocal(evento.target.value);
    if (!nuevaFecha) return;
    setFechaReporte(nuevaFecha);
    setMensajePDF(null);
  }

  async function manejarExportarPDF() {
    if (generandoPDF) return;

    try {
      setGenerandoPDF(true);
      setMensajePDF(null);

      // Consulta independiente del estado del hook: no afecta
      // la lista de ventas mostrada en pantalla (que sigue
      // siendo siempre la de "hoy").
      const ventasDeLaFecha = await obtenerVentasPorFecha(fechaReporte);

      // Un vendedor exporta solo sus propias ventas; el
      // administrador exporta todas, igual que en la vista.
      const ventasParaReporte = esAdministrador
        ? ventasDeLaFecha
        : ventasDeLaFecha.filter((venta) => venta.usuarioId === perfilActual.id);

      if (ventasParaReporte.length === 0) {
        setMensajePDF("No existen ventas registradas para esta fecha.");
        return;
      }

      const nombreGenerador =
        (perfilActual as { nombre?: string; nombre_completo?: string }).nombre ??
        (perfilActual as { nombre?: string; nombre_completo?: string }).nombre_completo ??
        (esAdministrador ? "Administrador" : "Usuario");

      await generarReporteVentasPDF({
        ventas: ventasParaReporte,
        fecha: fechaReporte,
        usuario: nombreGenerador,
      });
    } catch (error) {
      console.error(error);
      setMensajePDF("No fue posible generar el reporte PDF.");
    } finally {
      setGenerandoPDF(false);
    }
  }

  // ==========================================================
  // ABRIR / CERRAR DETALLE
  // ==========================================================

  function abrirDetalle(resumen: ResumenVentasUsuario) {
    setUsuarioSeleccionado(resumen);
  }

  function cerrarDetalle() {
    setUsuarioSeleccionado(null);
  }

  // ==========================================================
  // MODAL DETALLE
  // ==========================================================

  if (usuarioSeleccionado) {
    return <VentasUsuarioModal resumen={usuarioSeleccionado} onCerrar={cerrarDetalle} />;
  }

  // ==========================================================
  // RENDER PRINCIPAL
  // ==========================================================

  return (
    <div className="ventas-module">
      {/* ENCABEZADO */}
      <div className="vm-page-header">
        <div>
          <h2>Ventas</h2>
          <p>{esAdministrador ? "Registro diario de ventas por usuario." : "Registro de tus ventas realizadas hoy."}</p>
        </div>

        <div className="vm-header-actions">
          <label className="vm-date-field">
            <span className="vm-date-icon" aria-hidden="true">📅</span>
            <input
              type="date"
              value={fechaAValorInput(fechaReporte)}
              onChange={manejarCambioFecha}
              max={fechaAValorInput(fechaLocalDeHoy())}
              className="vm-date-input"
              aria-label="Fecha del reporte a exportar"
            />
          </label>

          <button type="button" onClick={manejarRecargar} disabled={cargando} className="vm-refresh-btn">
            {cargando ? <IconSpinner size={15} /> : <IconRefresh size={15} />}
            {cargando ? "Cargando..." : "Actualizar"}
          </button>

          <button
            type="button"
            onClick={manejarExportarPDF}
            disabled={generandoPDF}
            className="vm-pdf-btn"
          >
            {generandoPDF ? <IconSpinner size={15} /> : <IconFileDown size={15} />}
            {generandoPDF ? "Generando PDF..." : "Exportar PDF"}
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="vm-error-banner" role="alert">
          <span className="vm-error-text">
            <IconAlertTriangle size={16} />
            {error}
          </span>
          <button type="button" onClick={limpiarError} className="vm-error-close" aria-label="Cerrar aviso">
            <IconX size={13} />
          </button>
        </div>
      )}

      {/* MENSAJE DE EXPORTACIÓN PDF (p.ej. sin ventas en la fecha) */}
      {mensajePDF && (
        <div className="vm-pdf-banner" role="status">
          <span className="vm-error-text">
            <IconAlertTriangle size={16} />
            {mensajePDF}
          </span>
          <button
            type="button"
            onClick={() => setMensajePDF(null)}
            className="vm-error-close"
            aria-label="Cerrar aviso"
          >
            <IconX size={13} />
          </button>
        </div>
      )}

      {/* RESUMEN GENERAL */}
      <div className="vm-summary-card">
        <div>
          <div className="vm-summary-label">Total vendido hoy</div>
          <strong className="vm-summary-total">{formatoCOP(totalDelDia)}</strong>
        </div>

        <div className="vm-summary-count">
          <strong>{cantidadVentas}</strong>
          <span>{etiquetaVentas(cantidadVentas, "venta realizada", "ventas realizadas")}</span>
        </div>
      </div>

      {/* CONTENEDOR */}
      <div className="vm-panel" aria-busy={cargando}>
        <div className="vm-panel-header">
          <h3>{esAdministrador ? "Ventas por usuario" : "Mis ventas"}</h3>
          <p>
            {esAdministrador
              ? "Selecciona un usuario para ver sus ventas y los productos vendidos."
              : "Selecciona tu registro para ver el detalle de tus ventas."}
          </p>
        </div>

        {/* CARGANDO */}
        {cargando && (
          <div className="vm-loading">
            <IconSpinner size={16} />
            <span>Cargando ventas...</span>
          </div>
        )}

        {/* SIN VENTAS */}
        {!cargando && resumenVisible.length === 0 && (
          <div className="vm-empty">
            <IconTray size={30} />
            <strong>Todavía no hay ventas hoy.</strong>
            <p>Las ventas aparecerán aquí cuando se cierre una mesa.</p>
          </div>
        )}

        {/* LISTA DE USUARIOS */}
        {!cargando && resumenVisible.length > 0 && (
          <div className="vm-user-list">
            {resumenVisible.map((resumen) => (
              <button
                key={resumen.usuarioId ?? "sin-usuario"}
                type="button"
                onClick={() => abrirDetalle(resumen)}
                className="vm-user-row"
              >
                <span className="vm-user-avatar">{inicialesDeNombre(resumen.usuarioNombre)}</span>

                <span className="vm-user-info">
                  <strong>{resumen.usuarioNombre}</strong>
                  <span className="vm-user-meta">
                    {resumen.cantidadVentas} {etiquetaVentas(resumen.cantidadVentas, "venta", "ventas")} · Ver detalle
                  </span>
                </span>

                <span className="vm-user-total">{formatoCOP(resumen.totalVentas)}</span>
                <span className="vm-user-arrow" aria-hidden="true">
                  <IconChevronRight size={16} />
                </span>
              </button>
            ))}
          </div>
        )}

        {/* TOTAL FINAL */}
        {!cargando && cantidadVentas > 0 && (
          <div className="vm-total-final">
            <div>
              <div className="vm-total-final-label">{esAdministrador ? "Total de ventas del día" : "Total de mis ventas"}</div>
              <div className="vm-total-final-count">
                {cantidadVentas} {etiquetaVentas(cantidadVentas, "venta registrada", "ventas registradas")}
              </div>
            </div>

            <strong className="vm-total-final-amount">{formatoCOP(totalDelDia)}</strong>
          </div>
        )}
      </div>

      <style jsx>{`
        .ventas-module {
          --vm-ink: #14181c;
          --vm-surface: #ffffff;
          --vm-surface-muted: #f6f7f8;
          --vm-border: #e4e7eb;
          --vm-text: #1f2430;
          --vm-text-muted: #6b7280;
          --vm-green: #157a3d;
          --vm-green-deep: #0f5c2e;
          --vm-amber: #f5a524;
          --vm-danger: #c0362c;
          --vm-danger-bg: #fdf0ef;
          --vm-mono: ui-monospace, "SF Mono", "Roboto Mono", "Cascadia Code", Menlo, Consolas, monospace;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: var(--vm-text);
        }

        .vm-page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }
        .vm-page-header h2 { margin: 0 0 4px; font-size: 22px; font-weight: 650; letter-spacing: -0.01em; color: var(--vm-ink); }
        .vm-page-header p { margin: 0; font-size: 14px; color: var(--vm-text-muted); }

        .vm-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .vm-date-field {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0 12px;
          height: 42px;
          background: var(--vm-surface);
          border: 1.5px solid var(--vm-border);
          border-radius: 10px;
        }
        .vm-date-icon { font-size: 14px; line-height: 1; }
        .vm-date-input {
          border: none;
          outline: none;
          background: transparent;
          font-size: 14px;
          font-weight: 600;
          color: var(--vm-ink);
          font-family: inherit;
        }
        .vm-date-input:focus-visible { outline: none; }

        .vm-refresh-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 18px;
          border: none;
          border-radius: 10px;
          background: var(--vm-ink);
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease, transform 0.1s ease;
        }
        .vm-refresh-btn:hover:not(:disabled) { background: #20262d; }
        .vm-refresh-btn:active:not(:disabled) { transform: scale(0.98); }
        .vm-refresh-btn:disabled { background: #9aa3ad; cursor: not-allowed; }
        .vm-refresh-btn:focus-visible { outline: 2px solid var(--vm-ink); outline-offset: 2px; }

        .vm-pdf-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 18px;
          border: 1.5px solid var(--vm-green);
          border-radius: 10px;
          background: var(--vm-green);
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease, transform 0.1s ease;
        }
        .vm-pdf-btn:hover:not(:disabled) { background: var(--vm-green-deep); border-color: var(--vm-green-deep); }
        .vm-pdf-btn:active:not(:disabled) { transform: scale(0.98); }
        .vm-pdf-btn:disabled { background: #9aa3ad; border-color: #9aa3ad; cursor: not-allowed; }
        .vm-pdf-btn:focus-visible { outline: 2px solid var(--vm-green-deep); outline-offset: 2px; }

        .vm-pdf-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 16px;
          margin-bottom: 24px;
          background: #fff8e6;
          border: 1px solid #f5deA0;
          border-left: 3px solid var(--vm-amber);
          border-radius: 10px;
          color: #7a5b06;
        }
        .vm-pdf-banner .vm-error-text { color: #7a5b06; }

        .vm-error-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 16px;
          margin-bottom: 24px;
          background: var(--vm-danger-bg);
          border: 1px solid #f6d2ce;
          border-left: 3px solid var(--vm-danger);
          border-radius: 10px;
          color: #8a2a22;
        }
        .vm-error-text { display: flex; align-items: center; gap: 10px; font-size: 13.5px; }
        .vm-error-close {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 26px;
          height: 26px;
          border: none;
          border-radius: 50%;
          background: transparent;
          color: #8a2a22;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .vm-error-close:hover { background: rgba(192, 54, 44, 0.12); }
        .vm-error-close:focus-visible { outline: 2px solid #8a2a22; outline-offset: 2px; }

        .vm-summary-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          padding: 26px 28px;
          margin-bottom: 24px;
          background: var(--vm-ink);
          border-radius: 16px;
          color: #fff;
        }
        .vm-summary-label { margin-bottom: 8px; font-size: 12.5px; font-weight: 600; letter-spacing: 0.03em; color: rgba(255, 255, 255, 0.6); }
        .vm-summary-total { font: 700 34px/1 var(--vm-mono); letter-spacing: -0.01em; color: var(--vm-amber); }
        .vm-summary-count {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          padding: 12px 20px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 12px;
        }
        .vm-summary-count strong { font: 700 20px/1 var(--vm-mono); }
        .vm-summary-count span { margin-top: 4px; font-size: 12px; color: rgba(255, 255, 255, 0.6); }

        .vm-panel {
          background: var(--vm-surface);
          border: 1px solid var(--vm-border);
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 1px 2px rgba(20, 24, 28, 0.04), 0 8px 24px -12px rgba(20, 24, 28, 0.12);
        }
        .vm-panel-header h3 { margin: 0 0 6px; font-size: 17px; font-weight: 650; color: var(--vm-ink); }
        .vm-panel-header p { margin: 0 0 22px; font-size: 13.5px; color: var(--vm-text-muted); }

        .vm-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 44px 20px;
          color: var(--vm-text-muted);
          font-size: 14px;
        }

        .vm-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 44px 20px;
          color: var(--vm-text-muted);
          text-align: center;
        }
        .vm-empty svg { opacity: 0.45; }
        .vm-empty strong { font-size: 14.5px; color: var(--vm-text); }
        .vm-empty p { margin: 0; max-width: 280px; font-size: 13px; }

        .vm-user-list { display: flex; flex-direction: column; gap: 10px; }

        .vm-user-row {
          all: unset;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          padding: 14px 16px;
          background: var(--vm-surface-muted);
          border: 1px solid var(--vm-border);
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .vm-user-row:hover { background: #eef0f2; border-color: #d7dbe0; }
        .vm-user-row:focus-visible { outline: 2px solid var(--vm-green); outline-offset: 1px; }

        .vm-user-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #fff;
          border: 1px solid var(--vm-border);
          font: 700 13px/1 var(--vm-mono);
          color: var(--vm-ink);
        }

        .vm-user-info { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
        .vm-user-info strong {
          font-size: 14.5px;
          font-weight: 650;
          color: var(--vm-ink);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .vm-user-meta { font-size: 12.5px; color: var(--vm-text-muted); }

        .vm-user-total { flex-shrink: 0; font: 700 15.5px/1 var(--vm-mono); color: var(--vm-green-deep); white-space: nowrap; }
        .vm-user-arrow { flex-shrink: 0; display: flex; color: var(--vm-text-muted); }

        .vm-total-final {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin-top: 22px;
          padding-top: 20px;
          border-top: 1.5px solid var(--vm-border);
        }
        .vm-total-final-label { font-size: 13px; font-weight: 700; color: var(--vm-ink); }
        .vm-total-final-count { margin-top: 4px; font-size: 12px; color: var(--vm-text-muted); }
        .vm-total-final-amount { font: 700 26px/1 var(--vm-mono); color: var(--vm-green-deep); }

        @keyframes vm-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        :global(.vm-spin) { animation: vm-spin 0.8s linear infinite; transform-origin: center; }

        @media (max-width: 640px) {
          .vm-page-header { flex-direction: column; align-items: stretch; }
          .vm-header-actions { flex-direction: column; align-items: stretch; width: 100%; }
          .vm-date-field { height: 44px; width: 100%; box-sizing: border-box; }
          .vm-refresh-btn, .vm-pdf-btn { justify-content: center; width: 100%; box-sizing: border-box; min-height: 44px; }
          .vm-summary-card { flex-direction: column; align-items: stretch; padding: 22px; }
          .vm-summary-count { flex-direction: row; align-items: center; justify-content: space-between; align-self: stretch; }
          .vm-panel { padding: 20px; }
          .vm-user-row { padding: 12px; }
          .vm-total-final { flex-direction: column; align-items: flex-start; }
          .vm-total-final-amount { font-size: 22px; }
          .vm-pdf-banner { flex-wrap: wrap; }
        }

        @media (max-width: 380px) {
          .vm-summary-total { font-size: 28px; }
          .vm-user-info strong { font-size: 14px; }
          .vm-date-input { font-size: 13px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .vm-refresh-btn,
          .vm-pdf-btn,
          .vm-user-row,
          :global(.vm-spin) {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
