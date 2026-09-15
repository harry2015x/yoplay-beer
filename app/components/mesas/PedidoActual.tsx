"use client";

import { ItemPedido, formatoCOP } from "../../../types/mesas";

type Props = {
  productos: ItemPedido[];
  total: number;
  onAumentar: (productoId: number) => void;
  onDisminuir: (productoId: number) => void;
  onEliminar: (productoId: number) => void;
  onSolicitarCierre: () => void;
};

export default function PedidoActual({
  productos,
  total,
  onAumentar,
  onDisminuir,
  onEliminar,
  onSolicitarCierre,
}: Props) {
  return (
    <div className="pedido-panel">
      <h3 className="pedido-titulo">🧾 Pedido actual</h3>

      <div className="pedido-lista">
        {productos.length === 0 ? (
          <p className="pedido-vacio">No hay productos agregados todavía.</p>
        ) : (
          productos.map((item) => (
            <div key={item.productoId} className="pedido-item">
              <div className="pedido-item-header">
                <div>
                  <strong>{item.nombre}</strong>
                  <br />
                  <span className="pedido-item-preciounit">
                    {formatoCOP(item.precio)} c/u
                  </span>
                </div>
                <strong>{formatoCOP(item.precio * item.cantidad)}</strong>
              </div>

              <div className="pedido-cantidad-fila">
                <button
                  onClick={() => onDisminuir(item.productoId)}
                  aria-label={`Restar una unidad de ${item.nombre}`}
                  className="mesa-btn pedido-btn-cantidad pedido-btn-restar"
                >
                  −
                </button>

                <strong>{item.cantidad}</strong>

                <button
                  onClick={() => onAumentar(item.productoId)}
                  aria-label={`Sumar una unidad de ${item.nombre}`}
                  className="mesa-btn pedido-btn-cantidad pedido-btn-sumar"
                >
                  +
                </button>

                <button
                  onClick={() => onEliminar(item.productoId)}
                  aria-label={`Eliminar ${item.nombre} del pedido`}
                  className="mesa-btn pedido-btn-eliminar"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pedido-footer">
        <div className="pedido-total-fila">
          <h2 className="pedido-total-label">Total</h2>
          <h2 className="pedido-total-valor">{formatoCOP(total)}</h2>
        </div>

        <button
          onClick={onSolicitarCierre}
          disabled={total <= 0}
          className={`mesa-btn pedido-btn-cobrar${
            total <= 0 ? " pedido-btn-cobrar--deshabilitado" : ""
          }`}
        >
          Cobrar / Cerrar cuenta
        </button>
      </div>

      <style jsx>{`
        /* ============================================================
           BASE — valores idénticos a los estilos inline originales.
           Sin cambios visuales por defecto (incluido móvil).
        ============================================================ */

        .pedido-panel {
          background: #f9fafb;
          border-radius: 14px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 0;
        }

        .pedido-titulo {
          margin-top: 0;
          flex-shrink: 0;
        }

        .pedido-lista {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding-right: 6px;
        }

        .pedido-vacio {
          color: #6b7280;
        }

        .pedido-item {
          padding: 14px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .pedido-item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .pedido-item-preciounit {
          color: #6b7280;
          font-size: 13px;
        }

        .pedido-cantidad-fila {
          margin-top: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pedido-btn-cantidad {
          color: white;
          border: none;
          width: 30px;
          height: 30px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
        }
        .pedido-btn-restar {
          background: #ef4444;
        }
        .pedido-btn-sumar {
          background: #16a34a;
        }

        .pedido-btn-eliminar {
          margin-left: auto;
          background: transparent;
          border: 1px solid #d1d5db;
          color: #6b7280;
          padding: 6px 10px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
        }

        .pedido-footer {
          flex-shrink: 0;
        }

        .pedido-total-fila {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 2px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .pedido-total-label {
          margin: 0;
          font-size: 18px;
        }

        .pedido-total-valor {
          margin: 0;
          color: #16a34a;
        }

        .pedido-btn-cobrar {
          width: 100%;
          margin-top: 14px;
          color: white;
          border: none;
          padding: 14px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 16px;
          background: #ef4444;
          cursor: pointer;
        }
        .pedido-btn-cobrar--deshabilitado {
          background: #fca5a5;
          cursor: not-allowed;
        }

        /* ============================================================
           MEJORAS EXCLUSIVAS DE ESCRITORIO (≥769px)
           Móvil conserva exactamente los valores base de arriba.
        ============================================================ */

        @media (min-width: 769px) {
          .pedido-panel {
            padding: 22px 22px 20px;
            border-radius: 16px;
            box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.03);
          }

          .pedido-titulo {
            font-size: 16px;
            letter-spacing: -0.01em;
            margin-bottom: 4px;
          }

          .pedido-lista {
            padding-right: 10px;
          }

          /* Scrollbar del pedido actual: fino y discreto */
          .pedido-lista {
            scrollbar-width: thin;
            scrollbar-color: rgba(21, 128, 61, 0.22) transparent;
          }
          .pedido-lista::-webkit-scrollbar {
            width: 6px;
          }
          .pedido-lista::-webkit-scrollbar-track {
            background: transparent;
          }
          .pedido-lista::-webkit-scrollbar-thumb {
            background-color: rgba(21, 128, 61, 0.2);
            border-radius: 999px;
          }
          .pedido-lista:hover::-webkit-scrollbar-thumb {
            background-color: rgba(21, 128, 61, 0.38);
          }

          .pedido-item {
            padding: 13px 8px;
            margin: 0 -8px;
            border-bottom: 1px solid #eef0f2;
            border-radius: 10px;
            transition: background-color 120ms ease;
          }
          .pedido-item:hover {
            background: #ffffff;
            box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
          }
          .pedido-item:last-child {
            border-bottom: none;
          }

          .pedido-btn-cantidad {
            transition: filter 120ms ease, transform 120ms ease;
          }

          .pedido-btn-eliminar {
            transition:
              background-color 120ms ease,
              color 120ms ease,
              border-color 120ms ease;
          }
          .pedido-btn-eliminar:hover {
            background: #fef2f2;
            border-color: #fca5a5;
            color: #b91c1c;
          }

          .pedido-total-fila {
            margin-top: 14px;
            padding-top: 14px;
          }

          .pedido-total-label {
            font-size: 15px;
            font-weight: 600;
            color: #374151;
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }

          .pedido-total-valor {
            font-size: 22px;
            font-weight: 800;
          }

          .pedido-btn-cobrar {
            padding: 13px;
            border-radius: 10px;
            box-shadow: 0 6px 16px rgba(239, 68, 68, 0.25);
            transition:
              filter 120ms ease,
              transform 120ms ease,
              box-shadow 120ms ease;
          }
          .pedido-btn-cobrar--deshabilitado {
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
}
