"use client";

import { useState } from "react";

import type { Jornada } from "../../../hooks/useJornada";

// ============================================================
// NOTA:
//
// `onDescargarReporte` debe apuntar a la MISMA función reutilizable
// que usa el botón "📄 Exportar PDF" del módulo Ventas (por ejemplo
// generarReporteJornada(jornada)), para no duplicar la lógica de
// generación de PDF. Ver comentario al final de este archivo.
// ============================================================

type CerrarJornadaModalProps = {
  abierto: boolean;
  jornada: Jornada;
  totalVendido: number;
  ventasRealizadas: number;
  procesando: boolean;
  formatoCOP: (valor: number) => string;
  onDescargarReporte: () => Promise<void> | void;
  onCancelar: () => void;
  onConfirmarCierre: () => void;
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

export default function CerrarJornadaModal({
  abierto,
  jornada,
  totalVendido,
  ventasRealizadas,
  procesando,
  formatoCOP,
  onDescargarReporte,
  onCancelar,
  onConfirmarCierre,
}: CerrarJornadaModalProps) {

  const [descargando, setDescargando] = useState(false);

  if (!abierto) return null;

  async function manejarDescarga() {
    setDescargando(true);

    try {
      await onDescargarReporte();
    } finally {
      setDescargando(false);
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <h2 className="modal__titulo">🔴 Cerrar jornada</h2>

        <p className="modal__texto">
          Estás a punto de finalizar la jornada actual.
        </p>

        <div className="modal__resumen">
          <div className="modal__fila">
            <span>Inicio de jornada</span>
            <strong>{formatearFechaHora(jornada.fecha_inicio)}</strong>
          </div>
          <div className="modal__fila">
            <span>Ventas realizadas</span>
            <strong>{ventasRealizadas}</strong>
          </div>
          <div className="modal__fila">
            <span>Total vendido</span>
            <strong>{formatoCOP(totalVendido)}</strong>
          </div>
        </div>

        <p className="modal__nota">
          Antes de cerrar la jornada puedes descargar el reporte de ventas.
        </p>

        <div className="modal__acciones">
          <button
            onClick={manejarDescarga}
            disabled={descargando}
            className="modal__boton modal__boton--secundario"
          >
            {descargando ? "Generando..." : "📄 Descargar reporte"}
          </button>

          <button
            onClick={onCancelar}
            disabled={procesando}
            className="modal__boton modal__boton--neutral"
          >
            Cancelar
          </button>

          <button
            onClick={onConfirmarCierre}
            disabled={procesando}
            className="modal__boton modal__boton--peligro"
          >
            {procesando ? "Procesando..." : "🔴 Cerrar jornada"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          z-index: 1000;
        }
        .modal {
          background: #fff;
          border-radius: 16px;
          padding: 26px;
          width: 100%;
          max-width: 440px;
          max-height: calc(100vh - 32px);
          overflow-y: auto;
          box-shadow: 0 10px 40px rgba(15, 23, 42, 0.25);
          box-sizing: border-box;
        }
        .modal__titulo {
          margin: 0 0 10px;
          font-size: 19px;
        }
        .modal__texto {
          margin: 0 0 16px;
          color: #64748b;
          font-size: 14px;
        }
        .modal__resumen {
          background: #f8fafc;
          border-radius: 10px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }
        .modal__fila {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          font-size: 13.5px;
          color: #334155;
        }
        .modal__nota {
          font-size: 13px;
          color: #64748b;
          margin: 0 0 18px;
        }
        .modal__acciones {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .modal__boton {
          border: none;
          border-radius: 10px;
          padding: 14px 18px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          width: 100%;
          transition: filter 0.2s ease, transform 0.2s ease;
        }
        .modal__boton:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .modal__boton--secundario {
          background: #0d1512;
          color: #fff;
        }
        .modal__boton--neutral {
          background: #f1f5f9;
          color: #334155;
        }
        .modal__boton--peligro {
          background: #dc2626;
          color: #fff;
        }
        .modal__boton:not(:disabled):hover {
          filter: brightness(1.08);
        }
      `}</style>
    </div>
  );
}

// ============================================================
// PENDIENTE DE INTEGRACIÓN:
//
// El PDF real (logo, colores, detalle de ventas) debe generarse
// con la MISMA función que ya usa el botón "Exportar PDF" del
// módulo Ventas. Como ese componente no fue compartido en esta
// conversación, `onDescargarReporte` se deja como una función
// inyectada desde el padre (page.tsx) para que, una vez tengamos
// esa lógica, se conecte aquí sin tocar este componente.
// ============================================================
