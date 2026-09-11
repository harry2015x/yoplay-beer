"use client";

import { useState } from "react";

import type { PeriodoReporte } from "../../../types/reportes";

type Props = {
  periodo: PeriodoReporte;
  fechaInicio: string;
  fechaFin: string;
  cargando: boolean;
  onCambiarPeriodo: (periodo: PeriodoReporte) => void;
  onAplicarPersonalizado: (inicio: string, fin: string) => void;
};

const OPCIONES: { valor: PeriodoReporte; etiqueta: string }[] = [
  { valor: "hoy", etiqueta: "Hoy" },
  { valor: "ayer", etiqueta: "Ayer" },
  { valor: "semana", etiqueta: "Semana" },
  { valor: "quincena", etiqueta: "Quincena" },
  { valor: "mes", etiqueta: "Mes" },
];

export default function FiltrosReportes({
  periodo,
  fechaInicio,
  fechaFin,
  cargando,
  onCambiarPeriodo,
  onAplicarPersonalizado,
}: Props) {
  const [mostrarPersonalizado, setMostrarPersonalizado] = useState(
    periodo === "personalizado"
  );
  const [inicioLocal, setInicioLocal] = useState(fechaInicio);
  const [finLocal, setFinLocal] = useState(fechaFin);

  const rangoValido =
    Boolean(inicioLocal) && Boolean(finLocal) && inicioLocal <= finLocal;

  function manejarClicPersonalizado() {
    // Sincroniza los campos con las últimas fechas aplicadas
    // antes de mostrar el panel.
    setInicioLocal(fechaInicio);
    setFinLocal(fechaFin);
    setMostrarPersonalizado(true);
  }

  function manejarAplicar() {
    if (!rangoValido) return;
    onAplicarPersonalizado(inicioLocal, finLocal);
  }

  return (
    <div className="rp-filtros">
      <div className="rp-filtros-botones">
        {OPCIONES.map((opcion) => (
          <button
            key={opcion.valor}
            type="button"
            disabled={cargando}
            onClick={() => {
              setMostrarPersonalizado(false);
              onCambiarPeriodo(opcion.valor);
            }}
            className={`rp-filtro-btn${
              periodo === opcion.valor ? " rp-filtro-btn--activo" : ""
            }`}
          >
            {opcion.etiqueta}
          </button>
        ))}

        <button
          type="button"
          disabled={cargando}
          onClick={manejarClicPersonalizado}
          className={`rp-filtro-btn${
            periodo === "personalizado" ? " rp-filtro-btn--activo" : ""
          }`}
        >
          Personalizado
        </button>
      </div>

      {mostrarPersonalizado && (
        <div className="rp-rango-personalizado">
          <label className="rp-campo-fecha">
            <span>Fecha inicial</span>
            <input
              type="date"
              value={inicioLocal}
              max={finLocal || undefined}
              onChange={(e) => setInicioLocal(e.target.value)}
            />
          </label>

          <label className="rp-campo-fecha">
            <span>Fecha final</span>
            <input
              type="date"
              value={finLocal}
              min={inicioLocal || undefined}
              onChange={(e) => setFinLocal(e.target.value)}
            />
          </label>

          <button
            type="button"
            onClick={manejarAplicar}
            disabled={!rangoValido || cargando}
            className="rp-aplicar-btn"
          >
            Aplicar filtro
          </button>
        </div>
      )}

      <style jsx>{`
        .rp-filtros {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .rp-filtros-botones {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .rp-filtro-btn {
          padding: 10px 16px;
          border: 1px solid #e4e7eb;
          border-radius: 10px;
          background: #fff;
          color: #1f2430;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease,
            color 0.15s ease;
        }
        .rp-filtro-btn:hover:not(:disabled) {
          background: #f6f7f8;
          border-color: #d7dbe0;
        }
        .rp-filtro-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .rp-filtro-btn--activo {
          background: #14181c;
          border-color: #14181c;
          color: #fff;
        }
        .rp-rango-personalizado {
          display: flex;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 12px;
          padding: 16px;
          background: #f6f7f8;
          border: 1px solid #e4e7eb;
          border-radius: 12px;
        }
        .rp-campo-fecha {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 600;
          color: #6b7280;
        }
        .rp-campo-fecha input {
          padding: 9px 10px;
          border: 1px solid #e4e7eb;
          border-radius: 8px;
          font-size: 13.5px;
          color: #1f2430;
          background: #fff;
        }
        .rp-aplicar-btn {
          padding: 10px 18px;
          border: none;
          border-radius: 10px;
          background: #157a3d;
          color: #fff;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          transition: filter 0.15s ease;
        }
        .rp-aplicar-btn:hover:not(:disabled) {
          filter: brightness(1.08);
        }
        .rp-aplicar-btn:disabled {
          background: #9aa3ad;
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .rp-filtros-botones {
            gap: 6px;
          }
          .rp-filtro-btn {
            flex: 1 1 calc(33.333% - 6px);
            text-align: center;
            padding: 10px 8px;
          }
          .rp-rango-personalizado {
            flex-direction: column;
            align-items: stretch;
          }
          .rp-aplicar-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}