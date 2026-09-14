"use client";

import { useState } from "react";

import { Mesa, formatoCOP } from "../../../types/mesas";

type MetodoPago = "efectivo" | "transferencia" | "combinado";

type Props = {
  mesa: Mesa;

  /** true mientras se está registrando la venta en Supabase. */
  procesando: boolean;

  /** Se llama solo cuando el pago ya es válido (recibido >= total si es efectivo). */
  onConfirmar: () => void;

  onCancelar: () => void;
};

export default function CerrarCuentaModal({
  mesa,
  procesando,
  onConfirmar,
  onCancelar,
}: Props) {
  // ==========================================================
  // ESTADO LOCAL DEL MODAL
  //
  // Método de pago y dinero recibido viven solo mientras este
  // modal está montado. El padre lo renderiza con key={mesa.id},
  // así que cada mesa siempre empieza desde cero (sin arrastrar
  // el método o el dinero recibido de una venta anterior).
  // ==========================================================

  const [metodo, setMetodo] = useState<MetodoPago>("efectivo");
  const [recibidoTexto, setRecibidoTexto] = useState("");

  // ==========================================================
  // COMBINADO: efectivo + transferencia (reutiliza el mismo
  // patrón de validación que "efectivo", pero vacío = 0 en vez
  // de inválido, según lo pedido para este método).
  // ==========================================================

  const [combinadoEfectivoTexto, setCombinadoEfectivoTexto] = useState("");
  const [combinadoTransferenciaTexto, setCombinadoTransferenciaTexto] =
    useState("");

  const total = mesa.total;

  const recibidoNumero =
    recibidoTexto.trim() === "" ? null : Number(recibidoTexto);

  const recibidoValido =
    recibidoNumero !== null &&
    !Number.isNaN(recibidoNumero) &&
    recibidoNumero >= 0;

  const cambio =
    metodo === "efectivo" && recibidoValido ? recibidoNumero! - total : 0;

  const esInsuficiente =
    metodo === "efectivo" && recibidoValido && recibidoNumero! < total;

  // ==========================================================
  // CÁLCULO DEL PAGO COMBINADO
  //
  // TOTAL_RECIBIDO = EFECTIVO_RECIBIDO + TRANSFERENCIA_RECIBIDA
  // Campo vacío = $0 (no es un valor inválido como en "efectivo").
  // ==========================================================

  const combinadoEfectivoNumero =
    combinadoEfectivoTexto.trim() === ""
      ? 0
      : Number(combinadoEfectivoTexto);

  const combinadoTransferenciaNumero =
    combinadoTransferenciaTexto.trim() === ""
      ? 0
      : Number(combinadoTransferenciaTexto);

  const combinadoTotalRecibido =
    combinadoEfectivoNumero + combinadoTransferenciaNumero;

  // El cambio solo se calcula cuando TOTAL_RECIBIDO > TOTAL_VENTA.
  const combinadoCambio =
    combinadoTotalRecibido > total ? combinadoTotalRecibido - total : 0;

  const combinadoFaltante =
    combinadoTotalRecibido < total ? total - combinadoTotalRecibido : 0;

  const combinadoEsSuficiente = combinadoTotalRecibido >= total;

  const puedeConfirmar =
    !procesando &&
    (metodo === "transferencia" ||
      (metodo === "efectivo" && recibidoValido && recibidoNumero! >= total) ||
      (metodo === "combinado" && combinadoEsSuficiente));

  function esSoloDigitos(valor: string) {
    // Solo dígitos (sin negativos ni letras) — evita valores inválidos
    // mientras el usuario escribe.
    return valor === "" || /^\d*$/.test(valor);
  }

  function manejarCambioRecibido(valor: string) {
    if (esSoloDigitos(valor)) {
      setRecibidoTexto(valor);
    }
  }

  function manejarCambioCombinadoEfectivo(valor: string) {
    if (esSoloDigitos(valor)) {
      setCombinadoEfectivoTexto(valor);
    }
  }

  function manejarCambioCombinadoTransferencia(valor: string) {
    if (esSoloDigitos(valor)) {
      setCombinadoTransferenciaTexto(valor);
    }
  }

  // ==========================================================
  // CAMBIAR MÉTODO DE PAGO
  //
  // Al cambiar de método se limpian los campos que ya no
  // aplican, para que un valor de un método anterior nunca
  // afecte el cálculo del método recién seleccionado.
  // ==========================================================

  function seleccionarMetodo(nuevo: MetodoPago) {
    setMetodo(nuevo);
    setRecibidoTexto("");
    setCombinadoEfectivoTexto("");
    setCombinadoTransferenciaTexto("");
  }

  function manejarConfirmar() {
    if (!puedeConfirmar) return;
    onConfirmar();
  }

  return (
    <div
      role="presentation"
      onClick={procesando ? undefined : onCancelar}
      className="cerrar-cuenta-overlay"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cerrar-cuenta-titulo"
        onClick={(evento) => evento.stopPropagation()}
        className="mesas-modal-entrada cerrar-cuenta-dialogo"
      >
        {/* ========================================= */}
        {/* ENCABEZADO */}
        {/* ========================================= */}

        <div className="cerrar-cuenta-header">
          <h3 id="cerrar-cuenta-titulo" className="cerrar-cuenta-titulo">
            Cerrar cuenta — Mesa {mesa.numero}
          </h3>
          <span className="cerrar-cuenta-productos">
            Productos: {mesa.productos.length}
          </span>
        </div>

        {/* ========================================= */}
        {/* CONTENIDO */}
        {/* ========================================= */}

        <div className="cerrar-cuenta-contenido">
          <div className="cerrar-cuenta-total-fila">
            <span>Total a pagar</span>
            <strong className="cerrar-cuenta-total-valor">
              {formatoCOP(total)}
            </strong>
          </div>

          {/* ================================= */}
          {/* MÉTODO DE PAGO */}
          {/* ================================= */}

          <div role="radiogroup" aria-label="Método de pago">
            <span className="cerrar-cuenta-seccion-titulo">
              Método de pago
            </span>

            <div className="cerrar-cuenta-metodos">
              <button
                type="button"
                role="radio"
                aria-checked={metodo === "efectivo"}
                onClick={() => seleccionarMetodo("efectivo")}
                className={`mesa-btn cerrar-cuenta-metodo-btn${
                  metodo === "efectivo" ? " cerrar-cuenta-metodo-btn--activo" : ""
                }`}
              >
                <span className="cerrar-cuenta-metodo-radio" aria-hidden="true" />
                💵 Efectivo
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={metodo === "transferencia"}
                onClick={() => seleccionarMetodo("transferencia")}
                className={`mesa-btn cerrar-cuenta-metodo-btn${
                  metodo === "transferencia"
                    ? " cerrar-cuenta-metodo-btn--activo"
                    : ""
                }`}
              >
                <span className="cerrar-cuenta-metodo-radio" aria-hidden="true" />
                🏦 Transferencia
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={metodo === "combinado"}
                onClick={() => seleccionarMetodo("combinado")}
                className={`mesa-btn cerrar-cuenta-metodo-btn${
                  metodo === "combinado"
                    ? " cerrar-cuenta-metodo-btn--activo"
                    : ""
                }`}
              >
                <span className="cerrar-cuenta-metodo-radio" aria-hidden="true" />
                💵🏦 Combinado
              </button>
            </div>
          </div>

          {/* ================================= */}
          {/* EFECTIVO: DINERO RECIBIDO + CAMBIO */}
          {/* ================================= */}

          {metodo === "efectivo" && (
            <div className="cerrar-cuenta-efectivo">
              <label
                htmlFor="cerrar-cuenta-recibido"
                className="cerrar-cuenta-seccion-titulo"
              >
                Dinero recibido
              </label>

              <input
                id="cerrar-cuenta-recibido"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={recibidoTexto}
                onChange={(evento) =>
                  manejarCambioRecibido(evento.target.value)
                }
                placeholder="Ej: 100000"
                aria-label="Dinero recibido"
                aria-invalid={esInsuficiente}
                className="cerrar-cuenta-input"
              />

              <div className="cerrar-cuenta-resumen">
                <div className="cerrar-cuenta-resumen-fila">
                  <span>Total</span>
                  <span>{formatoCOP(total)}</span>
                </div>
                <div className="cerrar-cuenta-resumen-fila">
                  <span>Recibido</span>
                  <span>
                    {recibidoValido ? formatoCOP(recibidoNumero!) : "—"}
                  </span>
                </div>
                <div className="cerrar-cuenta-resumen-fila cerrar-cuenta-resumen-cambio">
                  <span>Cambio</span>
                  <span>
                    {recibidoValido && !esInsuficiente
                      ? formatoCOP(cambio)
                      : "—"}
                  </span>
                </div>
              </div>

              {esInsuficiente && (
                <p role="alert" className="cerrar-cuenta-error">
                  El dinero recibido es insuficiente.
                </p>
              )}
            </div>
          )}

          {/* ================================= */}
          {/* COMBINADO: EFECTIVO + TRANSFERENCIA */}
          {/* ================================= */}

          {metodo === "combinado" && (
            <div className="cerrar-cuenta-efectivo cerrar-cuenta-combinado">
              <div className="cerrar-cuenta-combinado-campo">
                <label
                  htmlFor="cerrar-cuenta-combinado-efectivo"
                  className="cerrar-cuenta-seccion-titulo"
                >
                  Pago en efectivo
                </label>

                <input
                  id="cerrar-cuenta-combinado-efectivo"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={combinadoEfectivoTexto}
                  onChange={(evento) =>
                    manejarCambioCombinadoEfectivo(evento.target.value)
                  }
                  placeholder="Ej: 30000"
                  aria-label="Dinero recibido en efectivo"
                  className="cerrar-cuenta-input"
                />
              </div>

              <div className="cerrar-cuenta-combinado-campo">
                <label
                  htmlFor="cerrar-cuenta-combinado-transferencia"
                  className="cerrar-cuenta-seccion-titulo"
                >
                  Pago por transferencia
                </label>

                <input
                  id="cerrar-cuenta-combinado-transferencia"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={combinadoTransferenciaTexto}
                  onChange={(evento) =>
                    manejarCambioCombinadoTransferencia(evento.target.value)
                  }
                  placeholder="Ej: 23000"
                  aria-label="Valor recibido por transferencia"
                  className="cerrar-cuenta-input"
                />
              </div>

              <div className="cerrar-cuenta-resumen">
                <div className="cerrar-cuenta-resumen-fila">
                  <span>Total de la cuenta</span>
                  <span>{formatoCOP(total)}</span>
                </div>
                <div className="cerrar-cuenta-resumen-fila">
                  <span>Efectivo recibido</span>
                  <span>{formatoCOP(combinadoEfectivoNumero)}</span>
                </div>
                <div className="cerrar-cuenta-resumen-fila">
                  <span>Transferencia</span>
                  <span>{formatoCOP(combinadoTransferenciaNumero)}</span>
                </div>
                <div className="cerrar-cuenta-resumen-fila">
                  <span>Total recibido</span>
                  <span>{formatoCOP(combinadoTotalRecibido)}</span>
                </div>

                {combinadoEsSuficiente ? (
                  <div className="cerrar-cuenta-resumen-fila cerrar-cuenta-resumen-cambio">
                    <span>Cambio</span>
                    <span>{formatoCOP(combinadoCambio)}</span>
                  </div>
                ) : (
                  <div className="cerrar-cuenta-resumen-fila cerrar-cuenta-resumen-faltante">
                    <span>Faltante</span>
                    <span>{formatoCOP(combinadoFaltante)}</span>
                  </div>
                )}
              </div>

              {!combinadoEsSuficiente && (
                <p role="alert" className="cerrar-cuenta-error">
                  El pago recibido es insuficiente.
                </p>
              )}
            </div>
          )}
        </div>

        {/* ========================================= */}
        {/* PIE / BOTONES */}
        {/* ========================================= */}

        <div className="cerrar-cuenta-footer">
          <button
            type="button"
            onClick={onCancelar}
            disabled={procesando}
            className="mesa-btn cerrar-cuenta-btn-cancelar"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={manejarConfirmar}
            disabled={!puedeConfirmar}
            className="mesa-btn cerrar-cuenta-btn-confirmar"
          >
            {procesando ? "Procesando..." : "Confirmar pago"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .cerrar-cuenta-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }

        .cerrar-cuenta-dialogo {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 420px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .cerrar-cuenta-header {
          padding: 20px 24px 14px;
          border-bottom: 1px solid #e5e7eb;
          flex-shrink: 0;
        }

        .cerrar-cuenta-titulo {
          margin: 0;
          color: #111827;
        }

        .cerrar-cuenta-productos {
          display: block;
          margin-top: 4px;
          font-size: 13px;
          color: #6b7280;
        }

        .cerrar-cuenta-contenido {
          padding: 18px 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .cerrar-cuenta-total-fila {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          background: #f9fafb;
          border-radius: 10px;
          padding: 12px 14px;
          color: #374151;
          font-size: 14px;
        }

        .cerrar-cuenta-total-valor {
          color: #16a34a;
          font-size: 22px;
        }

        .cerrar-cuenta-seccion-titulo {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: #374151;
          margin-bottom: 8px;
        }

        .cerrar-cuenta-metodos {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .cerrar-cuenta-metodo-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          background: #fff;
          color: #374151;
          font-size: 14.5px;
          font-weight: 600;
          cursor: pointer;
          text-align: left;
        }

        .cerrar-cuenta-metodo-btn--activo {
          border-color: #2563eb;
          background: #eff6ff;
          color: #1d4ed8;
        }

        .cerrar-cuenta-metodo-radio {
          flex-shrink: 0;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid #9ca3af;
          box-sizing: border-box;
          position: relative;
        }

        .cerrar-cuenta-metodo-btn--activo .cerrar-cuenta-metodo-radio {
          border-color: #2563eb;
        }

        .cerrar-cuenta-metodo-btn--activo .cerrar-cuenta-metodo-radio::after {
          content: "";
          position: absolute;
          inset: 3px;
          border-radius: 50%;
          background: #2563eb;
        }

        .cerrar-cuenta-efectivo {
          display: flex;
          flex-direction: column;
        }

        .cerrar-cuenta-input {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          font-size: 15px;
          color: #111827;
        }
        .cerrar-cuenta-input:focus-visible {
          outline: 2px solid #2563eb;
          outline-offset: 1px;
          border-color: #2563eb;
        }
        .cerrar-cuenta-input[aria-invalid="true"] {
          border-color: #ef4444;
        }

        .cerrar-cuenta-resumen {
          margin-top: 12px;
          background: #f9fafb;
          border-radius: 10px;
          padding: 10px 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .cerrar-cuenta-resumen-fila {
          display: flex;
          justify-content: space-between;
          font-size: 13.5px;
          color: #4b5563;
        }

        .cerrar-cuenta-resumen-cambio {
          font-weight: 700;
          color: #16a34a;
          padding-top: 4px;
          border-top: 1px dashed #e5e7eb;
          margin-top: 2px;
        }

        .cerrar-cuenta-resumen-faltante {
          font-weight: 700;
          color: #b91c1c;
          padding-top: 4px;
          border-top: 1px dashed #e5e7eb;
          margin-top: 2px;
        }

        .cerrar-cuenta-combinado {
          gap: 14px;
        }

        .cerrar-cuenta-combinado-campo {
          display: flex;
          flex-direction: column;
        }

        .cerrar-cuenta-error {
          margin: 10px 0 0;
          font-size: 13px;
          color: #b91c1c;
          font-weight: 600;
        }

        .cerrar-cuenta-footer {
          flex-shrink: 0;
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          padding: 16px 24px;
          border-top: 1px solid #e5e7eb;
        }

        .cerrar-cuenta-btn-cancelar {
          padding: 10px 16px;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          background: white;
          color: #374151;
          cursor: pointer;
          font-weight: 600;
        }

        .cerrar-cuenta-btn-confirmar {
          padding: 10px 16px;
          border-radius: 8px;
          border: none;
          background: #16a34a;
          color: white;
          cursor: pointer;
          font-weight: 700;
        }

        .cerrar-cuenta-btn-confirmar:disabled {
          background: #86efac;
          cursor: not-allowed;
        }

        .cerrar-cuenta-btn-cancelar:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .cerrar-cuenta-overlay {
            padding: 0;
            align-items: stretch;
          }

          .cerrar-cuenta-dialogo {
            max-width: 100vw;
            width: 100vw;
            height: 100dvh;
            max-height: 100dvh;
            border-radius: 0;
          }

          .cerrar-cuenta-header,
          .cerrar-cuenta-contenido,
          .cerrar-cuenta-footer {
            padding-left: 16px;
            padding-right: 16px;
          }

          .cerrar-cuenta-footer {
            flex-direction: column-reverse;
          }

          .cerrar-cuenta-btn-cancelar,
          .cerrar-cuenta-btn-confirmar {
            width: 100%;
            min-height: 44px;
          }
        }
      `}</style>
    </div>
  );
}
