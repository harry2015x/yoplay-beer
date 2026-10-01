"use client";

import { useMemo, useState } from "react";

import {
  Mesa,
  Producto,
  formatoCOP,
} from "../../../types/mesas";

import PedidoActual from "./PedidoActual";

import {
  IconoBolsa,
  IconoBuscar,
  IconoCaja,
  IconoCerrar,
  IconoMas,
  IconoNota,
  IconoSilla,
} from "./IconosMesas";

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
          <div className="mesa-modal-identidad">
            <span className="mesa-modal-icono">
              <IconoSilla tamano={22} />
            </span>

            <div className="mesa-modal-identidad-texto">
              <h2 id="mesa-modal-title" className="mesa-modal-titulo">
                Mesa {mesa.numero}
              </h2>

              <span className="mesa-modal-badge">
                <span className="mesa-modal-badge-punto" aria-hidden="true" />
                OCUPADA
              </span>
            </div>
          </div>

          {/* ========================================= */}
          {/* NOTA DE LA MESA (SOLO FRONTEND, NO SUPABASE) */}
          {/* ========================================= */}

          <div className="mesa-modal-nota">
            <label
              htmlFor="mesa-modal-nota-input"
              className="mesa-modal-nota-label"
            >
              <IconoNota tamano={14} />
              Nota de la mesa
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
                  <IconoCerrar tamano={16} />
                </button>
              )}
            </div>

            <span className="mesa-modal-nota-ayuda">
              Solo una ayuda visual mientras la mesa está abierta. No se
              guarda al cerrar la cuenta.
            </span>
          </div>

          <button
            onClick={onCerrarModal}
            aria-label="Cerrar panel de la mesa"
            className="mesa-btn mesa-modal-cerrar"
          >
            <IconoCerrar tamano={18} />
          </button>
        </div>

        {/* ========================================= */}
        {/* CONTENIDO */}
        {/* ========================================= */}

        <div className="mesa-modal-contenido">
          {/* ===================================== */}
          {/* PRODUCTOS */}
          {/* ===================================== */}

          <div className="mesa-modal-productos">
            <h3 className="mesa-modal-seccion-titulo">
              <span className="mesa-modal-seccion-icono">
                <IconoBolsa tamano={16} />
              </span>
              Productos
            </h3>

            {/* ================================= */}
            {/* BUSCADOR */}
            {/* ================================= */}

            <div className="mesa-modal-buscador-caja">
              <span className="mesa-modal-buscador-icono">
                <IconoBuscar tamano={17} />
              </span>

              <input
                type="search"
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                placeholder="Buscar producto..."
                aria-label="Buscar producto"
                className="mesa-modal-buscador"
              />
            </div>

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
                      <IconoBuscar tamano={22} />
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
                          <span aria-hidden="true">
                            <IconoCaja tamano={22} />
                          </span>
                        )}
                      </div>

                      {/* NOMBRE, PRECIO Y CATEGORÍA */}

                      <div className="mesa-modal-producto-texto">
                        <strong className="mesa-modal-producto-nombre">
                          {producto.nombre}
                        </strong>

                        <div className="mesa-modal-producto-meta">
                          <span className="mesa-modal-producto-precio">
                            {formatoCOP(producto.precio)}
                          </span>

                          {producto.categoria && (
                            <span className="mesa-modal-producto-categoria">
                              {producto.categoria}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* BOTÓN AGREGAR */}

                    <button
                      onClick={() => onAgregarProducto(producto)}
                      aria-label={`Agregar ${producto.nombre} a la mesa ${mesa.numero}`}
                      className="mesa-btn mesa-modal-agregar-btn"
                    >
                      <IconoMas tamano={16} />
                      Agregar
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
        /* ============================================================
           OVERLAY Y DIÁLOGO
           Paleta YOPLAY BEER: verde #16a34a, verde oscuro #0f5c2e,
           naranja #f59e0b, rojo #ef4444, tinta #14181c, fondos claros.
           Los iconos SVG vienen de IconosMesas, por eso se estilan
           con :global(svg).
        ============================================================ */

        .mesa-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(20, 24, 28, 0.55);
          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(3px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 16px;
        }

        .mesa-modal-dialogo {
          position: relative;
          background: white;
          border-radius: 22px;
          width: 100%;
          max-width: 1080px;
          max-height: 88vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          color: #1f2430;
          box-shadow:
            0 30px 60px -12px rgba(20, 24, 28, 0.35),
            0 0 0 1px rgba(20, 24, 28, 0.05);
        }

        /* Franja superior de estado (naranja = ocupada) */
        .mesa-modal-dialogo::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #f59e0b, #fbbf24);
          z-index: 1;
        }

        /* ============================================================
           ENCABEZADO
        ============================================================ */

        /* Escritorio: [ Mesa + estado ] [ nota ] [ cerrar ] en un solo renglón */
        .mesa-modal-header {
          padding: 14px 20px 14px 24px;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          grid-template-areas: "identidad nota cerrar";
          align-items: center;
          column-gap: 20px;
          row-gap: 12px;
          flex-shrink: 0;
          background: linear-gradient(180deg, #fffbeb 0%, #ffffff 100%);
          border-bottom: 1px solid #f1f2f4;
        }

        .mesa-modal-identidad {
          grid-area: identidad;
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .mesa-modal-icono {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #fef3c7;
          color: #92400e;
          box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.25);
        }

        .mesa-modal-identidad-texto {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 4px 10px;
          min-width: 0;
        }

        .mesa-modal-titulo {
          margin: 0;
          font-size: 20px;
          white-space: nowrap;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.1;
          color: #14181c;
        }

        .mesa-modal-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 11.5px;
          font-weight: 800;
          letter-spacing: 0.07em;
          padding: 5px 12px;
          border-radius: 999px;
          background: #fef3c7;
          color: #92400e;
          box-shadow: inset 0 0 0 1px #fde68a;
        }

        .mesa-modal-badge-punto {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #f59e0b;
          animation: mesa-modal-pulso 1.8s ease-out infinite;
        }

        @keyframes mesa-modal-pulso {
          0% {
            box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.55);
          }
          70%,
          100% {
            box-shadow: 0 0 0 7px rgba(245, 158, 11, 0);
          }
        }

        .mesa-modal-cerrar {
          grid-area: cerrar;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          padding: 0;
          border: 1px solid #e4e7eb;
          border-radius: 12px;
          background: white;
          color: #6b7280;
          cursor: pointer;
          transition:
            background-color 140ms ease,
            color 140ms ease,
            border-color 140ms ease,
            transform 120ms ease;
        }
        .mesa-modal-cerrar:hover {
          background: #f6f7f8;
          border-color: #d1d5db;
          color: #14181c;
        }
        .mesa-modal-cerrar :global(svg) {
          transition: transform 200ms ease;
        }
        .mesa-modal-cerrar:hover :global(svg) {
          transform: rotate(90deg);
        }

        /* ============================================================
           NOTA DE LA MESA (solo frontend, no Supabase)
        ============================================================ */

        .mesa-modal-nota {
          grid-area: nota;
          min-width: 0;
          padding: 7px 10px 6px 12px;
          background: rgba(255, 255, 255, 0.7);
          border: 1px dashed #fcd34d;
          border-radius: 12px;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          align-items: center;
          column-gap: 12px;
          row-gap: 3px;
        }

        .mesa-modal-nota-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #92400e;
          white-space: nowrap;
        }

        .mesa-modal-nota-fila {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .mesa-modal-nota-input {
          flex: 1;
          min-width: 0;
          box-sizing: border-box;
          min-height: 36px;
          padding: 7px 12px;
          border: 1px solid #fde68a;
          border-radius: 10px;
          font-family: inherit;
          font-size: 14px;
          color: #78350f;
          background: #fff;
          outline: none;
          transition:
            border-color 140ms ease,
            box-shadow 140ms ease;
        }
        .mesa-modal-nota-input::placeholder {
          color: #b45309;
          opacity: 0.55;
        }
        .mesa-modal-nota-input:focus {
          border-color: #f59e0b;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.18);
        }

        .mesa-modal-nota-borrar {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          min-height: 0;
          padding: 0;
          border-radius: 10px;
          border: 1px solid #fde68a;
          background: #fff;
          color: #92400e;
          cursor: pointer;
          transition:
            background-color 140ms ease,
            border-color 140ms ease;
        }
        .mesa-modal-nota-borrar:hover {
          background: #fef3c7;
          border-color: #fcd34d;
        }

        .mesa-modal-nota-ayuda {
          grid-column: 2;
          font-size: 11px;
          line-height: 1.3;
          color: #b45309;
          opacity: 0.85;
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
          padding: 14px 24px 18px;
          overflow: hidden;
        }

        .mesa-modal-productos {
          flex: 1.3 1 300px;
          min-width: 280px;
          min-height: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .mesa-modal-pedido-col {
          flex: 1 1 340px;
          min-width: 320px;
          min-height: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .mesa-modal-seccion-titulo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 10px;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: -0.01em;
          color: #14181c;
          flex-shrink: 0;
        }

        .mesa-modal-seccion-icono {
          width: 30px;
          height: 30px;
          border-radius: 9px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(22, 163, 74, 0.1);
          color: #157a3d;
        }

        /* ---------- Buscador ---------- */

        .mesa-modal-buscador-caja {
          position: relative;
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          flex-shrink: 0;
        }

        .mesa-modal-buscador-icono {
          position: absolute;
          left: 13px;
          display: inline-flex;
          color: #9aa3ad;
          pointer-events: none;
          transition: color 140ms ease;
        }

        .mesa-modal-buscador-caja:focus-within .mesa-modal-buscador-icono {
          color: #16a34a;
        }

        .mesa-modal-buscador {
          width: 100%;
          box-sizing: border-box;
          min-height: 42px;
          padding: 10px 14px 10px 40px;
          border: 1px solid #e4e7eb;
          border-radius: 12px;
          font-family: inherit;
          font-size: 14.5px;
          color: #1f2430;
          background: #f6f7f8;
          outline: none;
          transition:
            border-color 140ms ease,
            box-shadow 140ms ease,
            background-color 140ms ease;
        }
        .mesa-modal-buscador:hover {
          border-color: #d1d5db;
        }
        .mesa-modal-buscador:focus {
          background: #fff;
          border-color: #16a34a;
          box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.15);
        }
        .mesa-modal-buscador::placeholder {
          color: #9aa3ad;
        }

        /* ---------- Categorías ---------- */

        /* Se desliza con el dedo/rueda; sin barra visible. El difuminado
           del borde derecho indica que hay más categorías. El padding
           derecho deja la última categoría fuera del difuminado. */
        .mesa-modal-categorias {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          white-space: nowrap;
          padding: 2px 32px 2px 2px;
          margin: -2px 0 8px -2px;
          flex-shrink: 0;
          scrollbar-width: none;
          -webkit-mask-image: linear-gradient(90deg, #000 calc(100% - 40px), transparent);
          mask-image: linear-gradient(90deg, #000 calc(100% - 40px), transparent);
        }
        .mesa-modal-categorias::-webkit-scrollbar {
          display: none;
        }

        .mesa-modal-categoria-btn {
          flex-shrink: 0;
          min-height: 36px;
          padding: 7px 14px;
          border-radius: 999px;
          border: 1px solid #e4e7eb;
          background: #fff;
          color: #4b5563;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition:
            background-color 140ms ease,
            border-color 140ms ease,
            color 140ms ease,
            box-shadow 140ms ease;
        }
        .mesa-modal-categoria-btn:hover:not(.mesa-modal-categoria-btn--activa) {
          background: #f6f7f8;
          border-color: #d1d5db;
          color: #14181c;
        }
        .mesa-modal-categoria-btn--activa {
          background: #14181c;
          border-color: #14181c;
          color: #fff;
          box-shadow: 0 2px 8px rgba(20, 24, 28, 0.18);
        }

        /* ---------- Lista (única zona con scroll del panel izquierdo) ---------- */

        .mesa-modal-productos-lista {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 2px 6px 4px 2px;
        }

        /* Scrollbar fina y sin flechas. En Chrome, scrollbar-width /
           scrollbar-color anulan ::-webkit-scrollbar (y vuelven las
           flechas), por eso esas dos solo se aplican en Firefox. */
        .mesa-modal-productos-lista::-webkit-scrollbar {
          width: 6px;
        }
        .mesa-modal-productos-lista::-webkit-scrollbar-track {
          background: transparent;
        }
        .mesa-modal-productos-lista::-webkit-scrollbar-button {
          display: none;
        }
        .mesa-modal-productos-lista::-webkit-scrollbar-thumb {
          background-color: rgba(21, 128, 61, 0.22);
          border-radius: 999px;
        }
        .mesa-modal-productos-lista:hover::-webkit-scrollbar-thumb {
          background-color: rgba(21, 128, 61, 0.4);
        }
        @supports (-moz-appearance: none) {
          .mesa-modal-productos-lista {
            scrollbar-width: thin;
            scrollbar-color: rgba(21, 128, 61, 0.25) transparent;
          }
        }

        .mesa-modal-estado-info,
        .mesa-modal-estado-vacio {
          padding: 24px 20px;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
        .mesa-modal-estado-vacio {
          background: #f6f7f8;
          border: 1px dashed #d7dbe0;
          border-radius: 14px;
        }
        .mesa-modal-estado-vacio--busqueda {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 32px 16px;
        }
        .mesa-modal-estado-vacio-icono {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
          background: #fff;
          color: #9aa3ad;
          box-shadow: inset 0 0 0 1px #e4e7eb;
        }
        .mesa-modal-estado-vacio--busqueda strong {
          color: #1f2430;
          font-size: 14.5px;
        }
        .mesa-modal-estado-vacio--busqueda span:not(.mesa-modal-estado-vacio-icono) {
          font-size: 13px;
          max-width: 260px;
        }

        /* ---------- Tarjeta de producto ---------- */

        .mesa-modal-producto-fila {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 8px 8px 8px 8px;
          background: #fff;
          border: 1px solid #eef0f2;
          border-radius: 14px;
          flex-shrink: 0;
          transition:
            border-color 160ms ease,
            box-shadow 160ms ease,
            transform 160ms ease;
        }
        .mesa-modal-producto-fila:hover {
          border-color: #bbf7d0;
          box-shadow: 0 6px 16px rgba(16, 24, 40, 0.07);
        }

        .mesa-modal-producto-info {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          flex: 1 1 auto;
        }

        .mesa-modal-producto-imagen {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          border-radius: 10px;
          overflow: hidden;
          background: #f6f7f8;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9aa3ad;
          box-shadow: inset 0 0 0 1px rgba(20, 24, 28, 0.06);
        }
        .mesa-modal-producto-imagen > span {
          display: inline-flex;
        }
        .mesa-modal-producto-imagen-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 240ms ease;
        }
        .mesa-modal-producto-fila:hover .mesa-modal-producto-imagen-img {
          transform: scale(1.05);
        }

        .mesa-modal-producto-texto {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .mesa-modal-producto-nombre {
          display: block;
          font-size: 14px;
          font-weight: 700;
          color: #14181c;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .mesa-modal-producto-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 4px 8px;
          min-width: 0;
        }
        .mesa-modal-producto-precio {
          font-size: 14px;
          font-weight: 800;
          color: #0f5c2e;
          font-variant-numeric: tabular-nums;
        }
        .mesa-modal-producto-categoria {
          font-size: 11.5px;
          font-weight: 600;
          color: #6b7280;
          background: #f6f7f8;
          padding: 2px 8px;
          border-radius: 999px;
          max-width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mesa-modal-agregar-btn {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          min-height: 40px;
          padding: 8px 14px;
          background: #16a34a;
          color: white;
          border: none;
          border-radius: 11px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 700;
          white-space: nowrap;
          cursor: pointer;
          box-shadow: 0 3px 10px rgba(22, 163, 74, 0.22);
          transition:
            background-color 140ms ease,
            box-shadow 140ms ease,
            filter 120ms ease,
            transform 120ms ease;
        }
        .mesa-modal-agregar-btn:hover {
          background: #15803d;
          box-shadow: 0 6px 16px rgba(22, 163, 74, 0.32);
        }
        .mesa-modal-agregar-btn :global(svg) {
          transition: transform 160ms ease;
        }
        .mesa-modal-agregar-btn:hover :global(svg) {
          transform: rotate(90deg);
        }

        /* ---------- Foco accesible ---------- */

        .mesa-modal-cerrar:focus-visible,
        .mesa-modal-nota-borrar:focus-visible,
        .mesa-modal-categoria-btn:focus-visible,
        .mesa-modal-agregar-btn:focus-visible {
          outline: 2px solid #16a34a;
          outline-offset: 2px;
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

          /* Móvil: [ Mesa + estado ] [ cerrar ] y la nota debajo */
          .mesa-modal-header {
            padding: 14px 16px 12px;
            grid-template-columns: minmax(0, 1fr) auto;
            grid-template-areas:
              "identidad cerrar"
              "nota nota";
            row-gap: 10px;
          }

          .mesa-modal-cerrar {
            width: 44px;
            height: 44px;
          }

          .mesa-modal-nota {
            padding: 8px 10px;
            grid-template-columns: minmax(0, 1fr);
            row-gap: 5px;
          }

          .mesa-modal-nota-ayuda {
            grid-column: 1;
          }

          .mesa-modal-contenido {
            flex-direction: column;
            padding: 14px 16px 16px;
            gap: 14px;
          }

          .mesa-modal-productos,
          .mesa-modal-pedido-col {
            flex: 1 1 0;
            min-width: 0;
          }

          .mesa-modal-seccion-titulo {
            margin-bottom: 10px;
            font-size: 15px;
          }

          .mesa-modal-buscador-caja {
            margin-bottom: 10px;
          }
        }

        /* ============================================================
           MÓVIL PEQUEÑO (≤480px)
        ============================================================ */

        @media (max-width: 480px) {
          .mesa-modal-header {
            padding: 12px 12px 10px;
          }

          .mesa-modal-contenido {
            padding: 12px;
          }

          .mesa-modal-producto-imagen {
            width: 40px;
            height: 40px;
            border-radius: 9px;
          }

          .mesa-modal-producto-fila {
            gap: 10px;
            padding: 8px;
          }

          .mesa-modal-agregar-btn {
            padding: 8px 12px;
          }
        }

        /* ============================================================
           ESCRITORIO (≥769px): alto estable para que el pedido y el
           botón "Cobrar" no cambien de posición al filtrar.
        ============================================================ */

        @media (min-width: 769px) {
          .mesa-modal-dialogo {
            height: min(90vh, 820px);
            max-height: 90vh;
          }
        }

        /* Laptops con poca altura útil: aprovechar casi toda la pantalla */
        @media (min-width: 769px) and (max-height: 800px) {
          .mesa-modal-overlay {
            padding: 10px 16px;
          }

          .mesa-modal-dialogo {
            height: 96vh;
            max-height: 96vh;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .mesas-modal-entrada {
            animation: none !important;
          }

          .mesa-modal-badge-punto {
            animation: none;
          }

          .mesa-modal-cerrar:hover :global(svg),
          .mesa-modal-agregar-btn:hover :global(svg),
          .mesa-modal-producto-fila:hover .mesa-modal-producto-imagen-img {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
