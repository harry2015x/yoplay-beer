"use client";

import { ItemPedido, formatoCOP } from "../../../types/mesas";
import {
  IconoBasura,
  IconoBolsa,
  IconoMas,
  IconoMenos,
  IconoRecibo,
  IconoTarjeta,
} from "./IconosMesas";

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
      <div className="pedido-encabezado">
        <span className="pedido-encabezado-icono">
          <IconoRecibo tamano={16} />
        </span>
        <h3 className="pedido-titulo">Pedido actual</h3>
      </div>

      <div className="pedido-lista">
        {productos.length === 0 ? (
          <div className="pedido-vacio">
            <span className="pedido-vacio-icono" aria-hidden="true">
              <IconoBolsa tamano={22} />
            </span>
            <p className="pedido-vacio-texto">No hay productos agregados todavía.</p>
          </div>
        ) : (
          productos.map((item) => (
            <div key={item.productoId} className="pedido-item">
              <div className="pedido-item-header">
                <div className="pedido-item-info">
                  <span className="pedido-item-multiplicador" aria-hidden="true">
                    {item.cantidad}×
                  </span>
                  <div className="pedido-item-texto">
                    <strong className="pedido-item-nombre">{item.nombre}</strong>
                    <span className="pedido-item-preciounit">
                      {formatoCOP(item.precio)} c/u
                    </span>
                  </div>
                </div>
                <strong className="pedido-item-subtotal">
                  {formatoCOP(item.precio * item.cantidad)}
                </strong>
              </div>

              <div className="pedido-cantidad-fila">
                <div className="pedido-stepper">
                  <button
                    onClick={() => onDisminuir(item.productoId)}
                    aria-label={`Restar una unidad de ${item.nombre}`}
                    className="mesa-btn pedido-btn-cantidad pedido-btn-restar"
                  >
                    <IconoMenos tamano={16} />
                  </button>

                  <strong className="pedido-cantidad">{item.cantidad}</strong>

                  <button
                    onClick={() => onAumentar(item.productoId)}
                    aria-label={`Sumar una unidad de ${item.nombre}`}
                    className="mesa-btn pedido-btn-cantidad pedido-btn-sumar"
                  >
                    <IconoMas tamano={16} />
                  </button>
                </div>

                <button
                  onClick={() => onEliminar(item.productoId)}
                  aria-label={`Eliminar ${item.nombre} del pedido`}
                  className="mesa-btn pedido-btn-eliminar"
                >
                  <IconoBasura tamano={14} />
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
          <IconoTarjeta tamano={19} />
          Cobrar / Cerrar cuenta
        </button>
      </div>

      <style jsx>{`
        /* ============================================================
           PANEL "CARRITO"
           Paleta YOPLAY BEER: verde #16a34a, verde oscuro #0f5c2e,
           rojo #ef4444, tinta #14181c, neón #39ff14, fondos claros.
           Los iconos SVG vienen de IconosMesas: se estilan con
           :global(svg).
        ============================================================ */

        .pedido-panel {
          background: #f6f7f8;
          border: 1px solid #e4e7eb;
          border-radius: 18px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 0;
          box-sizing: border-box;
        }

        .pedido-encabezado {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          flex-shrink: 0;
        }

        .pedido-encabezado-icono {
          width: 30px;
          height: 30px;
          border-radius: 9px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #14181c;
          color: #39ff14;
        }

        .pedido-titulo {
          margin: 0;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: -0.01em;
          color: #14181c;
        }

        /* ---------- Lista (scroll interno) ---------- */

        .pedido-lista {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 2px 6px 2px 2px;
          margin-right: -6px;
          scrollbar-width: thin;
          scrollbar-color: rgba(21, 128, 61, 0.22) transparent;
        }
        .pedido-lista::-webkit-scrollbar {
          width: 6px;
        }
        .pedido-lista::-webkit-scrollbar-thumb {
          background-color: rgba(21, 128, 61, 0.2);
          border-radius: 999px;
        }

        .pedido-vacio {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 28px 16px;
          text-align: center;
          border: 1px dashed #d7dbe0;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.6);
        }

        .pedido-vacio-icono {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          color: #9aa3ad;
          box-shadow: inset 0 0 0 1px #e4e7eb;
        }

        .pedido-vacio-texto {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        /* ---------- Línea del pedido ---------- */

        .pedido-item {
          flex-shrink: 0;
          padding: 12px;
          background: #fff;
          border: 1px solid #eef0f2;
          border-radius: 14px;
          box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
          animation: pedido-item-entrada 220ms ease backwards;
          transition:
            border-color 160ms ease,
            box-shadow 160ms ease;
        }
        .pedido-item:hover {
          border-color: #e4e7eb;
          box-shadow: 0 4px 12px rgba(16, 24, 40, 0.07);
        }

        @keyframes pedido-item-entrada {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }

        .pedido-item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }

        .pedido-item-info {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          min-width: 0;
        }

        .pedido-item-multiplicador {
          flex-shrink: 0;
          min-width: 32px;
          padding: 3px 6px;
          border-radius: 8px;
          background: rgba(22, 163, 74, 0.1);
          color: #157a3d;
          font-size: 12.5px;
          font-weight: 800;
          text-align: center;
          font-variant-numeric: tabular-nums;
        }

        .pedido-item-texto {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .pedido-item-nombre {
          font-size: 14.5px;
          font-weight: 700;
          color: #14181c;
          overflow-wrap: anywhere;
        }

        .pedido-item-preciounit {
          color: #6b7280;
          font-size: 12.5px;
          font-variant-numeric: tabular-nums;
        }

        .pedido-item-subtotal {
          flex-shrink: 0;
          font-size: 15px;
          font-weight: 800;
          color: #14181c;
          font-variant-numeric: tabular-nums;
        }

        .pedido-cantidad-fila {
          margin-top: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pedido-stepper {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          padding: 3px;
          border-radius: 11px;
          background: #f6f7f8;
          box-shadow: inset 0 0 0 1px #e4e7eb;
        }

        .pedido-cantidad {
          min-width: 32px;
          text-align: center;
          font-size: 15px;
          font-weight: 800;
          color: #14181c;
          font-variant-numeric: tabular-nums;
        }

        .pedido-btn-cantidad {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          padding: 0;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition:
            background-color 140ms ease,
            color 140ms ease,
            filter 120ms ease,
            transform 120ms ease;
        }
        .pedido-btn-restar {
          background: #fef2f2;
          color: #dc2626;
        }
        .pedido-btn-restar:hover {
          background: #ef4444;
          color: #fff;
        }
        .pedido-btn-sumar {
          background: #16a34a;
          color: #fff;
          box-shadow: 0 2px 6px rgba(22, 163, 74, 0.3);
        }
        .pedido-btn-sumar:hover {
          background: #15803d;
        }

        .pedido-btn-eliminar {
          margin-left: auto;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          min-height: 34px;
          padding: 6px 10px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 9px;
          color: #9aa3ad;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition:
            background-color 140ms ease,
            color 140ms ease,
            border-color 140ms ease;
        }
        .pedido-btn-eliminar:hover {
          background: #fef2f2;
          border-color: #fecaca;
          color: #b91c1c;
        }

        .pedido-btn-cantidad:focus-visible,
        .pedido-btn-eliminar:focus-visible,
        .pedido-btn-cobrar:focus-visible {
          outline: 2px solid #16a34a;
          outline-offset: 2px;
        }

        /* ---------- Total + Cobrar ---------- */

        .pedido-footer {
          flex-shrink: 0;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px dashed #d7dbe0;
        }

        .pedido-total-fila {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          border-radius: 14px;
          background: linear-gradient(135deg, #14181c 0%, #1f2430 100%);
          box-shadow: 0 8px 20px rgba(20, 24, 28, 0.18);
        }

        .pedido-total-label {
          margin: 0;
          font-size: 12.5px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #9aa3ad;
        }

        .pedido-total-valor {
          margin: 0;
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.1;
          color: #fff;
          font-variant-numeric: tabular-nums;
          overflow-wrap: anywhere;
          text-align: right;
        }

        .pedido-btn-cobrar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          min-height: 54px;
          margin-top: 10px;
          padding: 14px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
          color: white;
          font-family: inherit;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 0.01em;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
          transition:
            box-shadow 160ms ease,
            filter 120ms ease,
            transform 120ms ease;
        }
        .pedido-btn-cobrar:hover:not(:disabled) {
          box-shadow: 0 10px 26px rgba(239, 68, 68, 0.4);
        }
        .pedido-btn-cobrar--deshabilitado {
          background: #fca5a5;
          box-shadow: none;
          cursor: not-allowed;
        }

        /* ============================================================
           MÓVIL (≤768px): más compacto para que Total y Cobrar
           queden siempre visibles en la mitad inferior.
        ============================================================ */

        @media (max-width: 768px) {
          .pedido-panel {
            padding: 14px;
            border-radius: 16px;
          }

          .pedido-encabezado {
            margin-bottom: 10px;
          }

          .pedido-item {
            padding: 10px;
          }

          .pedido-footer {
            margin-top: 10px;
            padding-top: 10px;
          }

          .pedido-total-fila {
            padding: 10px 14px;
          }

          .pedido-total-valor {
            font-size: 24px;
          }

          .pedido-btn-cobrar {
            min-height: 50px;
            padding: 12px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .pedido-item {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
