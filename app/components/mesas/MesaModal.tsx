"use client";

import { useMemo, useState } from "react";

import {
  Mesa,
  Producto,
  formatoCOP,
} from "../../../types/mesas";

import PedidoActual from "./PedidoActual";

type Props = {
  mesa: Mesa;

  /**
   * Productos reales
   * cargados desde Inventario.
   */
  productos: Producto[];

  cargandoProductos: boolean;

  onCerrarModal: () => void;

  onAgregarProducto: (
    producto: Producto
  ) => void;

  onAumentar: (
    productoId: number
  ) => void;

  onDisminuir: (
    productoId: number
  ) => void;

  onEliminar: (
    productoId: number
  ) => void;

  onSolicitarCierre: (
    mesa: Mesa
  ) => void;

  /**
   * Nota temporal de la mesa (solo frontend, nunca en Supabase).
   * Cadena vacía = sin nota.
   */
  nota: string;

  /** Actualiza la nota temporal de esta mesa en el hook. */
  onCambiarNota: (texto: string) => void;
};

const CATEGORIA_TODOS = "Todos";

export default function MesaModal({
  mesa,
  productos,
  cargandoProductos,
  onCerrarModal,
  onAgregarProducto,
  onAumentar,
  onDisminuir,
  onEliminar,
  onSolicitarCierre,
  nota,
  onCambiarNota,
}: Props) {
  // ==========================================================
  // BÚSQUEDA Y CATEGORÍA
  //
  // Estado local del modal. No depende de Supabase ni de
  // useMesas/useInventario: filtra en el cliente sobre el
  // array de productos que ya llega cargado por props.
  // ==========================================================

  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] =
    useState<string>(CATEGORIA_TODOS);

  // ==========================================================
  // CATEGORÍAS DISPONIBLES
  //
  // Se generan a partir de los productos reales, nunca de una
  // lista fija.
  // ==========================================================

  const categorias = useMemo(() => {
    const encontradas = new Set<string>();

    productos.forEach((producto) => {
      if (producto.categoria) {
        encontradas.add(producto.categoria);
      }
    });

    return [CATEGORIA_TODOS, ...Array.from(encontradas).sort()];
  }, [productos]);

  // ==========================================================
  // PRODUCTOS FILTRADOS
  //
  // 1. Filtra por categoría activa.
  // 2. Filtra por texto de búsqueda (case insensitive).
  // ==========================================================

  const productosFiltrados = useMemo(() => {
    const textoBusqueda = busqueda.trim().toLowerCase();

    return productos
      .filter((producto) => {
        if (categoriaActiva === CATEGORIA_TODOS) return true;
        return producto.categoria === categoriaActiva;
      })
      .filter((producto) => {
        if (!textoBusqueda) return true;
        return producto.nombre.toLowerCase().includes(textoBusqueda);
      });
  }, [productos, categoriaActiva, busqueda]);

  const hayProductosEnInventario = productos.length > 0;
  const hayResultados = productosFiltrados.length > 0;

  return (
    <div
      role="presentation"
      onClick={onCerrarModal}
      className="mesa-modal-overlay"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mesa-modal-title"
        onClick={(evento) => evento.stopPropagation()}
        className="mesas-modal-entrada mesa-modal-dialogo"
      >
        {/* ========================================= */}
        {/* ENCABEZADO */}
        {/* ========================================= */}

        <div className="mesa-modal-header">
          <div>
            <h2 id="mesa-modal-title" className="mesa-modal-titulo">
              🪑 Mesa {mesa.numero}
            </h2>

            <span className="mesa-modal-badge">OCUPADA</span>
          </div>

          <button
            onClick={onCerrarModal}
            aria-label="Cerrar panel de la mesa"
            className="mesa-btn mesa-modal-cerrar"
          >
            ×
          </button>
        </div>

        {/* ========================================= */}
        {/* NOTA DE LA MESA (SOLO FRONTEND, NO SUPABASE) */}
        {/* ========================================= */}

        <div className="mesa-modal-nota">
          <label
            htmlFor="mesa-modal-nota-input"
            className="mesa-modal-nota-label"
          >
            📝 Nota de la mesa
          </label>

          <div className="mesa-modal-nota-fila">
            <input
              id="mesa-modal-nota-input"
              type="text"
              value={nota}
              onChange={(evento) => onCambiarNota(evento.target.value)}
              placeholder="Ej: El señor de la gorra roja"
              maxLength={120}
              aria-label="Nota de la mesa"
              className="mesa-modal-nota-input"
            />

            {nota.trim() !== "" && (
              <button
                type="button"
                onClick={() => onCambiarNota("")}
                aria-label="Borrar nota de la mesa"
                className="mesa-btn mesa-modal-nota-borrar"
              >
                ×
              </button>
            )}
          </div>

          <span className="mesa-modal-nota-ayuda">
            Solo una ayuda visual mientras la mesa está abierta. No se
            guarda al cerrar la cuenta.
          </span>
        </div>

        {/* ========================================= */}
        {/* CONTENIDO */}
        {/* ========================================= */}

        <div className="mesa-modal-contenido">
          {/* ===================================== */}
          {/* PRODUCTOS */}
          {/* ===================================== */}

          <div className="mesa-modal-productos">
            <h3 className="mesa-modal-seccion-titulo">🛍️ Productos</h3>

            {/* ================================= */}
            {/* BUSCADOR */}
            {/* ================================= */}

            <input
              type="search"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="🔍 Buscar producto..."
              aria-label="Buscar producto"
              className="mesa-modal-buscador"
            />

            {/* ================================= */}
            {/* CATEGORÍAS */}
            {/* ================================= */}

            {categorias.length > 1 && (
              <div
                className="mesa-modal-categorias"
                role="group"
                aria-label="Filtrar por categoría"
              >
                {categorias.map((categoria) => (
                  <button
                    key={categoria}
                    type="button"
                    onClick={() => setCategoriaActiva(categoria)}
                    aria-pressed={categoriaActiva === categoria}
                    className={`mesa-btn mesa-modal-categoria-btn${
                      categoriaActiva === categoria
                        ? " mesa-modal-categoria-btn--activa"
                        : ""
                    }`}
                  >
                    {categoria}
                  </button>
                ))}
              </div>
            )}

            {/* ================================= */}
            {/* LISTA DE PRODUCTOS (ÚNICA ZONA CON SCROLL) */}
            {/* ================================= */}

            <div className="mesa-modal-productos-lista">
              {/* CARGANDO PRODUCTOS */}

              {cargandoProductos && (
                <div className="mesa-modal-estado-info">
                  Cargando productos...
                </div>
              )}

              {/* SIN PRODUCTOS EN EL INVENTARIO */}

              {!cargandoProductos && !hayProductosEnInventario && (
                <div className="mesa-modal-estado-vacio">
                  No hay productos disponibles en el inventario.
                </div>
              )}

              {/* SIN RESULTADOS DE BÚSQUEDA/FILTRO */}

              {!cargandoProductos &&
                hayProductosEnInventario &&
                !hayResultados && (
                  <div className="mesa-modal-estado-vacio mesa-modal-estado-vacio--busqueda">
                    <span
                      className="mesa-modal-estado-vacio-icono"
                      aria-hidden="true"
                    >
                      🔍
                    </span>
                    <strong>No encontramos productos.</strong>
                    <span>
                      Intenta con otro nombre o selecciona otra categoría.
                    </span>
                  </div>
                )}

              {/* LISTA */}

              {!cargandoProductos &&
                hayResultados &&
                productosFiltrados.map((producto) => (
                  <div key={producto.id} className="mesa-modal-producto-fila">
                    {/* INFORMACIÓN */}

                    <div className="mesa-modal-producto-info">
                      {/* IMAGEN */}

                      <div className="mesa-modal-producto-imagen">
                        {producto.imagenUrl ? (
                          <img
                            src={producto.imagenUrl}
                            alt={producto.nombre}
                            className="mesa-modal-producto-imagen-img"
                          />
                        ) : (
                          <span aria-hidden="true">📦</span>
                        )}
                      </div>

                      {/* NOMBRE Y PRECIO */}

                      <div className="mesa-modal-producto-texto">
                        <strong className="mesa-modal-producto-nombre">
                          {producto.nombre}
                        </strong>

                        {producto.categoria && (
                          <div className="mesa-modal-producto-categoria">
                            {producto.categoria}
                          </div>
                        )}

                        <span className="mesa-modal-producto-precio">
                          {formatoCOP(producto.precio)}
                        </span>
                      </div>
                    </div>

                    {/* BOTÓN AGREGAR */}

                    <button
                      onClick={() => onAgregarProducto(producto)}
                      aria-label={`Agregar ${producto.nombre} a la mesa ${mesa.numero}`}
                      className="mesa-btn mesa-modal-agregar-btn"
                    >
                      + Agregar
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* ===================================== */}
          {/* PEDIDO ACTUAL */}
          {/* ===================================== */}

          <div className="mesa-modal-pedido-col">
            <PedidoActual
              productos={mesa.productos}
              total={mesa.total}
              onAumentar={onAumentar}
              onDisminuir={onDisminuir}
              onEliminar={onEliminar}
              onSolicitarCierre={() => onSolicitarCierre(mesa)}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .mesa-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 20px;
        }

        .mesa-modal-dialogo {
          background: white;
          border-radius: 18px;
          width: 100%;
          max-width: 1000px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
        }

        .mesa-modal-header {
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e5e7eb;
          flex-shrink: 0;
        }

        .mesa-modal-titulo {
          margin: 0;
        }

        .mesa-modal-badge {
          font-size: 12px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 999px;
          background: #fef3c7;
          color: #92400e;
        }

        .mesa-modal-cerrar {
          background: #f3f4f6;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 18px;
          flex-shrink: 0;
        }

        /* ============================================================
           NOTA DE LA MESA (solo frontend, no Supabase)
        ============================================================ */

        .mesa-modal-nota {
          flex-shrink: 0;
          padding: 14px 24px;
          background: #fffbeb;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .mesa-modal-nota-label {
          font-size: 12.5px;
          font-weight: 700;
          color: #92400e;
        }

        .mesa-modal-nota-fila {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mesa-modal-nota-input {
          flex: 1;
          min-width: 0;
          box-sizing: border-box;
          padding: 10px 12px;
          border: 1px solid #fde68a;
          border-radius: 8px;
          font-size: 14px;
          color: #78350f;
          background: #fff;
        }
        .mesa-modal-nota-input::placeholder {
          color: #b45309;
          opacity: 0.6;
        }
        .mesa-modal-nota-input:focus-visible {
          outline: 2px solid #2563eb;
          outline-offset: 1px;
          border-color: #2563eb;
        }

        .mesa-modal-nota-borrar {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          min-height: 0;
          border-radius: 8px;
          border: 1px solid #fde68a;
          background: #fff;
          color: #92400e;
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
        }

        .mesa-modal-nota-ayuda {
          font-size: 11.5px;
          color: #b45309;
        }

        @media (max-width: 768px) {
          .mesa-modal-nota {
            padding: 12px 16px;
          }
        }

        /* ============================================================
           CONTENIDO: fila flex con dos columnas de altura acotada.
           Ninguna scrollea aquí — cada columna scrollea por dentro.
        ============================================================ */

        .mesa-modal-contenido {
          display: flex;
          flex-direction: row;
          flex: 1;
          min-height: 0;
          gap: 20px;
          padding: 20px 24px;
          overflow: hidden;
        }

        .mesa-modal-productos {
          flex: 1 1 280px;
          min-width: 280px;
          min-height: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .mesa-modal-pedido-col {
          flex: 1.2 1 320px;
          min-width: 320px;
          min-height: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .mesa-modal-seccion-titulo {
          margin-top: 0;
          margin-bottom: 12px;
          flex-shrink: 0;
        }

        .mesa-modal-buscador {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 14px;
          margin-bottom: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14.5px;
          color: #111827;
          background: #fff;
          flex-shrink: 0;
        }
        .mesa-modal-buscador:focus-visible {
          outline: 2px solid #2563eb;
          outline-offset: 1px;
          border-color: #2563eb;
        }
        .mesa-modal-buscador::placeholder {
          color: #9ca3af;
        }

        .mesa-modal-categorias {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          white-space: nowrap;
          padding-bottom: 10px;
          margin-bottom: 6px;
          scrollbar-width: thin;
          flex-shrink: 0;
        }

        .mesa-modal-categoria-btn {
          flex-shrink: 0;
          padding: 8px 14px;
          border-radius: 999px;
          border: 1px solid #e5e7eb;
          background: #fff;
          color: #374151;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .mesa-modal-categoria-btn--activa {
          background: #16a34a;
          border-color: #16a34a;
          color: #fff;
        }

        /* Única zona con scroll interno del panel izquierdo */
        .mesa-modal-productos-lista {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding-right: 4px;
        }

        .mesa-modal-estado-info,
        .mesa-modal-estado-vacio {
          padding: 20px;
          text-align: center;
          color: #6b7280;
        }
        .mesa-modal-estado-vacio {
          background: #f9fafb;
          border-radius: 10px;
        }
        .mesa-modal-estado-vacio--busqueda {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 32px 16px;
        }
        .mesa-modal-estado-vacio-icono {
          font-size: 26px;
          margin-bottom: 4px;
        }
        .mesa-modal-estado-vacio--busqueda strong {
          color: #374151;
          font-size: 14.5px;
        }
        .mesa-modal-estado-vacio--busqueda span {
          font-size: 13px;
          max-width: 260px;
        }

        .mesa-modal-producto-fila {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .mesa-modal-producto-info {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          flex: 1 1 auto;
        }

        .mesa-modal-producto-imagen {
          width: 54px;
          height: 54px;
          flex-shrink: 0;
          border-radius: 10px;
          overflow: hidden;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e5e7eb;
          font-size: 24px;
        }
        .mesa-modal-producto-imagen-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .mesa-modal-producto-texto {
          min-width: 0;
        }
        .mesa-modal-producto-nombre {
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .mesa-modal-producto-categoria {
          font-size: 12px;
          color: #6b7280;
          margin-top: 2px;
        }
        .mesa-modal-producto-precio {
          color: #6b7280;
          font-size: 14px;
          display: block;
          margin-top: 3px;
        }

        .mesa-modal-agregar-btn {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          background: #16a34a;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
          white-space: nowrap;
        }

        /* ============================================================
           TABLET / MÓVIL (≤768px): una sola columna vertical.
           Productos y Pedido se reparten el alto disponible al 50/50,
           cada uno con su propio scroll interno, para que el botón
           "Cobrar" quede siempre visible sin desplazarse por todo
           el catálogo.
        ============================================================ */

        @media (max-width: 768px) {
          .mesa-modal-overlay {
            padding: 0;
            align-items: stretch;
            justify-content: stretch;
          }

          .mesa-modal-dialogo {
            width: 100vw;
            max-width: 100vw;
            height: 100dvh;
            max-height: 100dvh;
            border-radius: 0;
          }

          .mesa-modal-header {
            padding: 16px;
          }

          .mesa-modal-cerrar {
            width: 44px;
            height: 44px;
            font-size: 20px;
          }

          .mesa-modal-contenido {
            flex-direction: column;
            padding: 16px;
            gap: 16px;
          }

          .mesa-modal-productos,
          .mesa-modal-pedido-col {
            flex: 1 1 0;
            min-width: 0;
          }

          .mesa-modal-agregar-btn {
            padding: 10px 16px;
          }
        }

        /* ============================================================
           MÓVIL PEQUEÑO (≤480px)
        ============================================================ */

        @media (max-width: 480px) {
          .mesa-modal-contenido {
            padding: 12px;
          }

          .mesa-modal-producto-imagen {
            width: 46px;
            height: 46px;
            font-size: 20px;
          }

          .mesa-modal-producto-fila {
            gap: 10px;
            padding: 10px 0;
          }

          .mesa-modal-buscador {
            padding: 11px 12px;
          }
        }

        /* ============================================================
           MEJORAS EXCLUSIVAS DE ESCRITORIO (≥769px)
           Solo estética/UX: scrollbars finos, jerarquía, espaciado.
           No modifica ninguna regla usada por el diseño móvil de arriba.
        ============================================================ */

        @media (min-width: 769px) {
          .mesa-modal-dialogo {
            border-radius: 20px;
            box-shadow:
              0 30px 60px -12px rgba(15, 23, 42, 0.28),
              0 0 0 1px rgba(15, 23, 42, 0.04);
          }

          .mesa-modal-header {
            padding: 22px 28px;
          }

          .mesa-modal-titulo {
            font-size: 20px;
            letter-spacing: -0.01em;
          }

          .mesa-modal-badge {
            padding: 4px 12px;
            margin-top: 6px;
            letter-spacing: 0.02em;
          }

          .mesa-modal-cerrar {
            transition: background-color 120ms ease;
          }
          .mesa-modal-cerrar:hover {
            background: #e5e7eb;
          }

          .mesa-modal-nota {
            padding: 12px 28px;
          }

          .mesa-modal-nota-label {
            letter-spacing: 0.02em;
          }

          .mesa-modal-contenido {
            padding: 22px 28px 26px;
            gap: 0;
          }

          .mesa-modal-productos {
            box-sizing: border-box;
            padding-right: 24px;
          }

          .mesa-modal-pedido-col {
            box-sizing: border-box;
            padding-left: 24px;
            border-left: 1px solid #eef0f2;
          }

          .mesa-modal-buscador {
            padding: 11px 14px;
            border-radius: 12px;
            transition: border-color 120ms ease;
          }
          .mesa-modal-buscador:hover {
            border-color: #d1d5db;
          }

          .mesa-modal-categorias {
            gap: 6px;
            padding-bottom: 8px;
          }

          .mesa-modal-categoria-btn {
            padding: 7px 14px;
            transition:
              background-color 120ms ease,
              border-color 120ms ease,
              color 120ms ease;
          }
          .mesa-modal-categoria-btn:hover:not(.mesa-modal-categoria-btn--activa) {
            background: #f3f4f6;
            border-color: #d1d5db;
          }

          .mesa-modal-productos-lista {
            padding-right: 10px;
          }

          .mesa-modal-producto-fila {
            padding: 12px 8px;
            margin: 0 -8px;
            border-radius: 10px;
            border-bottom: 1px solid #f1f2f4;
            transition: background-color 120ms ease;
          }
          .mesa-modal-producto-fila:hover {
            background: #f9fafb;
          }
          .mesa-modal-producto-fila:last-child {
            border-bottom: none;
          }

          .mesa-modal-producto-imagen {
            box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.04);
          }

          /* Scrollbar vertical — lista de productos: fino y discreto */
          .mesa-modal-productos-lista {
            scrollbar-width: thin;
            scrollbar-color: rgba(21, 128, 61, 0.25) transparent;
          }
          .mesa-modal-productos-lista::-webkit-scrollbar {
            width: 6px;
          }
          .mesa-modal-productos-lista::-webkit-scrollbar-track {
            background: transparent;
          }
          .mesa-modal-productos-lista::-webkit-scrollbar-thumb {
            background-color: rgba(21, 128, 61, 0.22);
            border-radius: 999px;
          }
          .mesa-modal-productos-lista:hover::-webkit-scrollbar-thumb {
            background-color: rgba(21, 128, 61, 0.4);
          }

          /* Scrollbar horizontal — categorías: mucho más discreta */
          .mesa-modal-categorias {
            scrollbar-width: thin;
            scrollbar-color: rgba(21, 128, 61, 0.2) transparent;
          }
          .mesa-modal-categorias::-webkit-scrollbar {
            height: 5px;
          }
          .mesa-modal-categorias::-webkit-scrollbar-track {
            background: transparent;
          }
          .mesa-modal-categorias::-webkit-scrollbar-thumb {
            background-color: rgba(21, 128, 61, 0.18);
            border-radius: 999px;
          }
          .mesa-modal-categorias:hover::-webkit-scrollbar-thumb {
            background-color: rgba(21, 128, 61, 0.35);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .mesas-modal-entrada {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}