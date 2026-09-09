"use client";

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
};

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
}: Props) {
  return (
    <div
      role="presentation"

      onClick={
        onCerrarModal
      }

      style={{
        position: "fixed",

        inset: 0,

        background:
          "rgba(15, 23, 42, 0.5)",

        display: "flex",

        alignItems: "center",

        justifyContent:
          "center",

        zIndex: 50,

        padding: "20px",
      }}
    >
      <div
        role="dialog"

        aria-modal="true"

        aria-labelledby={
          "mesa-modal-title"
        }

        onClick={(evento) =>
          evento.stopPropagation()
        }

        className="mesas-modal-entrada"

        style={{
          background: "white",

          borderRadius: "18px",

          width: "100%",

          maxWidth: "1000px",

          maxHeight: "88vh",

          display: "flex",

          flexDirection: "column",

          overflow: "hidden",

          boxShadow:
            "0 25px 50px rgba(0,0,0,0.25)",
        }}
      >
        {/* ========================================= */}
        {/* ENCABEZADO */}
        {/* ========================================= */}

        <div
          style={{
            padding: "20px 24px",

            display: "flex",

            justifyContent:
              "space-between",

            alignItems: "center",

            borderBottom:
              "1px solid #e5e7eb",
          }}
        >
          <div>
            <h2
              id="mesa-modal-title"

              style={{
                margin: 0,
              }}
            >
              🪑 Mesa {mesa.numero}
            </h2>

            <span
              style={{
                fontSize: "12px",

                fontWeight: 700,

                padding:
                  "3px 10px",

                borderRadius:
                  "999px",

                background:
                  "#fef3c7",

                color:
                  "#92400e",
              }}
            >
              OCUPADA
            </span>
          </div>

          <button
            onClick={
              onCerrarModal
            }

            aria-label={
              "Cerrar panel de la mesa"
            }

            className="mesa-btn"

            style={{
              background:
                "#f3f4f6",

              border: "none",

              width: "36px",

              height: "36px",

              borderRadius:
                "50%",

              cursor: "pointer",

              fontSize: "18px",
            }}
          >
            ×
          </button>
        </div>

        {/* ========================================= */}
        {/* CONTENIDO */}
        {/* ========================================= */}

        <div
          style={{
            display: "grid",

            gridTemplateColumns:
              "minmax(280px, 1fr) minmax(320px, 1.2fr)",

            gap: "20px",

            padding: "20px 24px",

            overflowY: "auto",
          }}
        >
          {/* ===================================== */}
          {/* PRODUCTOS */}
          {/* ===================================== */}

          <div>
            <h3
              style={{
                marginTop: 0,
              }}
            >
              🛍️ Productos
            </h3>

            {/* ================================= */}
            {/* CARGANDO PRODUCTOS */}
            {/* ================================= */}

            {cargandoProductos && (
              <div
                style={{
                  padding: "20px",

                  textAlign: "center",

                  color:
                    "#6b7280",
                }}
              >
                Cargando productos...
              </div>
            )}

            {/* ================================= */}
            {/* SIN PRODUCTOS */}
            {/* ================================= */}

            {!cargandoProductos &&
              productos.length === 0 && (
                <div
                  style={{
                    padding: "20px",

                    textAlign:
                      "center",

                    color:
                      "#6b7280",

                    background:
                      "#f9fafb",

                    borderRadius:
                      "10px",
                  }}
                >
                  No hay productos disponibles
                  en el inventario.
                </div>
              )}

            {/* ================================= */}
            {/* LISTA DE PRODUCTOS */}
            {/* ================================= */}

            {!cargandoProductos &&
              productos.map(
                (producto) => (
                  <div
                    key={
                      producto.id
                    }

                    style={{
                      display:
                        "flex",

                      justifyContent:
                        "space-between",

                      alignItems:
                        "center",

                      gap: "12px",

                      padding:
                        "12px 0",

                      borderBottom:
                        "1px solid #e5e7eb",
                    }}
                  >
                    {/* ========================= */}
                    {/* INFORMACIÓN */}
                    {/* ========================= */}

                    <div
                      style={{
                        display:
                          "flex",

                        alignItems:
                          "center",

                        gap: "12px",

                        minWidth: 0,
                      }}
                    >
                      {/* ======================= */}
                      {/* IMAGEN */}
                      {/* ======================= */}

                      <div
                        style={{
                          width:
                            "54px",

                          height:
                            "54px",

                          flexShrink: 0,

                          borderRadius:
                            "10px",

                          overflow:
                            "hidden",

                          background:
                            "#f3f4f6",

                          display:
                            "flex",

                          alignItems:
                            "center",

                          justifyContent:
                            "center",

                          border:
                            "1px solid #e5e7eb",
                        }}
                      >
                        {producto.imagenUrl ? (
                          <img
                            src={
                              producto.imagenUrl
                            }

                            alt={
                              producto.nombre
                            }

                            style={{
                              width:
                                "100%",

                              height:
                                "100%",

                              objectFit:
                                "cover",

                              display:
                                "block",
                            }}
                          />
                        ) : (
                          <span
                            style={{
                              fontSize:
                                "24px",
                            }}
                          >
                            📦
                          </span>
                        )}
                      </div>

                      {/* ======================= */}
                      {/* NOMBRE Y PRECIO */}
                      {/* ======================= */}

                      <div
                        style={{
                          minWidth: 0,
                        }}
                      >
                        <strong
                          style={{
                            display:
                              "block",

                            whiteSpace:
                              "nowrap",

                            overflow:
                              "hidden",

                            textOverflow:
                              "ellipsis",
                          }}
                        >
                          {
                            producto.nombre
                          }
                        </strong>

                        {producto.categoria && (
                          <div
                            style={{
                              fontSize:
                                "12px",

                              color:
                                "#6b7280",

                              marginTop:
                                "2px",
                            }}
                          >
                            {
                              producto.categoria
                            }
                          </div>
                        )}

                        <span
                          style={{
                            color:
                              "#6b7280",

                            fontSize:
                              "14px",

                            display:
                              "block",

                            marginTop:
                              "3px",
                          }}
                        >
                          {formatoCOP(
                            producto.precio
                          )}
                        </span>
                      </div>
                    </div>

                    {/* ========================= */}
                    {/* BOTÓN AGREGAR */}
                    {/* ========================= */}

                    <button
                      onClick={() =>
                        onAgregarProducto(
                          producto
                        )
                      }

                      aria-label={`Agregar ${producto.nombre} a la mesa ${mesa.numero}`}

                      className="mesa-btn"

                      style={{
                        background:
                          "#16a34a",

                        color:
                          "white",

                        border:
                          "none",

                        padding:
                          "8px 14px",

                        borderRadius:
                          "8px",

                        cursor:
                          "pointer",

                        fontWeight:
                          700,

                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      + Agregar
                    </button>
                  </div>
                )
              )}
          </div>

          {/* ===================================== */}
          {/* PEDIDO ACTUAL */}
          {/* ===================================== */}

          <PedidoActual
            productos={
              mesa.productos
            }

            total={
              mesa.total
            }

            onAumentar={
              onAumentar
            }

            onDisminuir={
              onDisminuir
            }

            onEliminar={
              onEliminar
            }

            onSolicitarCierre={() =>
              onSolicitarCierre(
                mesa
              )
            }
          />
        </div>
      </div>
    </div>
  );
}