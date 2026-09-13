"use client";

import type { Jornada } from "../../../hooks/useJornada";

// ============================================================
// NOTA SOBRE RUTAS DE IMPORTACIÓN:
//
// Se asume la misma convención de "hooks" en la raíz del
// proyecto usada por page.tsx (import ... from "../hooks/useX").
// Si tu estructura real ubica los hooks en otro lugar (por
// ejemplo con un alias "@/hooks/..."), ajusta este import.
// ============================================================

type JornadaControlProps = {
  esAdministrador: boolean;
  jornadaActiva: Jornada | null;
  cargando: boolean;
  procesando: boolean;
  error: string | null;
  onIniciar: () => void;
  onSolicitarCierre: () => void;
};

function formatearFechaHora(fechaISO: string): string {
  const fecha = new Date(fechaISO);

  return fecha.toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function JornadaControl({
  esAdministrador,
  jornadaActiva,
  cargando,
  procesando,
  error,
  onIniciar,
  onSolicitarCierre,
}: JornadaControlProps) {

  // ==========================================================
  // VENDEDOR: SOLO INDICADOR, SIN BOTONES DE CONTROL
  // ==========================================================

  if (!esAdministrador) {
    return (
      <div className="jornada-indicador">
        {jornadaActiva ? (
          <span className="jornada-indicador__pill jornada-indicador__pill--activa">
            🟢 Jornada activa
          </span>
        ) : (
          <span className="jornada-indicador__pill jornada-indicador__pill--inactiva">
            ⚪ Sin jornada activa
          </span>
        )}

        <style jsx>{`
          .jornada-indicador {
            margin: 18px 0 0;
          }
          .jornada-indicador__pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 14px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 600;
          }
          .jornada-indicador__pill--activa {
            background: rgba(57, 255, 20, 0.12);
            color: #0f8a3c;
          }
          .jornada-indicador__pill--inactiva {
            background: #f1f5f9;
            color: #64748b;
          }
        `}</style>
      </div>
    );
  }

  // ==========================================================
  // ADMINISTRADOR: CONTROL COMPLETO
  // ==========================================================

  return (
    <div className="jornada-control">
      {cargando ? (
        <p className="jornada-control__cargando">
          Cargando estado de la jornada...
        </p>
      ) : jornadaActiva ? (
        <div className="jornada-control__fila">
          <div>
            <span className="jornada-control__estado">🟢 Jornada activa</span>
            <p className="jornada-control__inicio">
              Inicio: {formatearFechaHora(jornadaActiva.fecha_inicio)}
            </p>
          </div>

          <button
            onClick={onSolicitarCierre}
            disabled={procesando}
            className="jornada-control__boton jornada-control__boton--cerrar"
          >
            {procesando ? "Procesando..." : "🔴 Cerrar jornada"}
          </button>
        </div>
      ) : (
        <div className="jornada-control__fila">
          <p className="jornada-control__mensaje">
            No hay una jornada activa. Inicia una para comenzar a registrar
            ventas.
          </p>

          <button
            onClick={onIniciar}
            disabled={procesando}
            className="jornada-control__boton jornada-control__boton--iniciar"
          >
            {procesando ? "Procesando..." : "🟢 Iniciar jornada"}
          </button>
        </div>
      )}

      {error && <p className="jornada-control__error">{error}</p>}

      <style jsx>{`
        .jornada-control {
          margin-top: 24px;
          padding: 20px;
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 2px 14px rgba(15, 23, 42, 0.06);
        }
        .jornada-control__cargando {
          margin: 0;
          color: #64748b;
        }
        .jornada-control__fila {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .jornada-control__estado {
          font-weight: 700;
          font-size: 15px;
          color: #0f172a;
        }
        .jornada-control__inicio {
          margin: 4px 0 0;
          color: #64748b;
          font-size: 13.5px;
        }
        .jornada-control__mensaje {
          margin: 0;
          color: #64748b;
          font-size: 14px;
          max-width: 420px;
        }
        .jornada-control__boton {
          border: none;
          border-radius: 10px;
          padding: 13px 22px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: filter 0.2s ease, transform 0.2s ease;
          white-space: nowrap;
        }
        .jornada-control__boton:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .jornada-control__boton--iniciar {
          background: linear-gradient(135deg, #39ff14, #16c784);
          color: #062012;
        }
        .jornada-control__boton--cerrar {
          background: #dc2626;
          color: #fff;
        }
        .jornada-control__boton:not(:disabled):hover {
          filter: brightness(1.08);
          transform: translateY(-1px);
        }
        .jornada-control__error {
          margin: 12px 0 0;
          color: #dc2626;
          font-size: 13px;
        }

        @media (max-width: 480px) {
          .jornada-control__fila {
            flex-direction: column;
            align-items: stretch;
          }
          .jornada-control__boton {
            width: 100%;
            padding: 15px 22px;
          }
        }
      `}</style>
    </div>
  );
}
