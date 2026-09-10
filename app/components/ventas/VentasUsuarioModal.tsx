"use client";

import {
  useState,
} from "react";

import type {
  VentaDetalle,
} from "../../../types/ventas";


// ============================================================
// TIPO DEL RESUMEN
// ============================================================

export type ResumenVentasUsuario = {

  usuarioId: string | null;

  usuarioNombre: string;

  cantidadVentas: number;

  totalVentas: number;

  ventas: VentaDetalle[];

};


// ============================================================
// PROPS
// ============================================================

type Props = {

  resumen:
    ResumenVentasUsuario;

  onCerrar:
    () => void;

};


// ============================================================
// FORMATO MONEDA
// ============================================================

function formatoCOP(
  valor: number
): string {

  return valor.toLocaleString(
    "es-CO",
    {

      style:
        "currency",

      currency:
        "COP",

      minimumFractionDigits:
        0,

      maximumFractionDigits:
        0,

    }
  );

}


// ============================================================
// FORMATO HORA
// ============================================================

function formatoHora(

  fecha:
    string
    | Date
    | null
    | undefined

): string {

  if (!fecha) {

    return "--:--";

  }


  const fechaObjeto =
    fecha instanceof Date
      ? fecha
      : new Date(fecha);


  if (
    Number.isNaN(
      fechaObjeto.getTime()
    )
  ) {

    return "--:--";

  }


  return fechaObjeto.toLocaleTimeString(
    "es-CO",
    {

      hour:
        "2-digit",

      minute:
        "2-digit",

      hour12:
        true,

    }
  );

}


// ============================================================
// COMPONENTE
// ============================================================

export default function VentasUsuarioModal({

  resumen,

  onCerrar,

}: Props) {


  // ==========================================================
  // VENTA SELECCIONADA
  // ==========================================================

  const [

    ventaSeleccionada,

    setVentaSeleccionada,

  ] = useState<number | null>(
    null
  );


  // ==========================================================
  // MOSTRAR / OCULTAR DETALLE
  // ==========================================================

  const seleccionarVenta = (
    ventaId: number
  ) => {

    setVentaSeleccionada(
      (ventaActual) => {

        if (
          ventaActual === ventaId
        ) {

          return null;

        }

        return ventaId;

      }
    );

  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div
      className="ventas-modal-overlay"
      onClick={onCerrar}
    >

      <div
        className="ventas-modal"
        onClick={
          (event) =>
            event.stopPropagation()
        }
      >


        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="ventas-modal-header">

          <div>

            <h2>

              💰 VENTAS DE{" "}

              {
                resumen.usuarioNombre
                  .toUpperCase()
              }

            </h2>


            <p>

              {
                resumen.cantidadVentas
              }{" "}

              {
                resumen.cantidadVentas === 1

                  ? "venta realizada"

                  : "ventas realizadas"
              }

            </p>

          </div>


          <button

            type="button"

            onClick={onCerrar}

            className="ventas-modal-close"

            aria-label="Cerrar"

          >

            ✕

          </button>

        </div>


        {/* ================================================= */}
        {/* LISTA DE VENTAS */}
        {/* ================================================= */}

        <div className="ventas-lista">


          {
            resumen.ventas.length === 0

              ? (

                <div
                  className="ventas-vacias"
                >

                  No hay ventas registradas
                  para este usuario.

                </div>

              )

              : (

                resumen.ventas.map(

                  (
                    venta
                  ) => {


                    const estaAbierta =
                      ventaSeleccionada ===
                      venta.id;


                    return (

                      <div
                        key={venta.id}
                        className="venta-item-container"
                      >


                        {/* ================================= */}
                        {/* CABECERA DE LA VENTA */}
                        {/* ================================= */}

                        <button

                          type="button"

                          onClick={() =>
                            seleccionarVenta(
                              venta.id
                            )
                          }

                          className="venta-item"

                          style={{

                            width:
                              "100%",

                            border:
                              "none",

                            background:
                              "transparent",

                            cursor:
                              "pointer",

                            textAlign:
                              "left",

                          }}

                        >


                          {/* HORA */}

                          <div
                            className="venta-hora"
                          >

                            ⏰{" "}

                            {
                              formatoHora(

                                venta.closedAt
                                ??
                                venta.createdAt

                              )
                            }

                          </div>


                          {/* MESA */}

                          <div
                            className="venta-mesa"
                          >

                            🪑 Mesa{" "}

                            {
                              venta.mesaNumero
                              ?? "-"
                            }

                          </div>


                          {/* TOTAL */}

                          <div
                            className="venta-total"
                          >

                            {
                              formatoCOP(
                                venta.total
                              )
                            }

                          </div>


                          {/* FLECHA */}

                          <div
                            style={{

                              fontSize:
                                "18px",

                              marginLeft:
                                "10px",

                            }}
                          >

                            {
                              estaAbierta

                                ? "▲"

                                : "▼"
                            }

                          </div>


                        </button>


                        {/* ================================= */}
                        {/* DETALLE DE PRODUCTOS */}
                        {/* ================================= */}

                        {
                          estaAbierta && (

                            <div

                              style={{

                                background:
                                  "#f8fafc",

                                borderRadius:
                                  "10px",

                                padding:
                                  "15px",

                                marginTop:
                                  "8px",

                                marginBottom:
                                  "15px",

                                border:
                                  "1px solid #e5e7eb",

                              }}

                            >


                              {/* ========================= */}
                              {/* TÍTULO */}
                              {/* ========================= */}

                              <div

                                style={{

                                  fontWeight:
                                    700,

                                  marginBottom:
                                    "12px",

                                  color:
                                    "#374151",

                                }}

                              >

                                🧾 Productos vendidos

                              </div>


                              {/* ========================= */}
                              {/* PRODUCTOS */}
                              {/* ========================= */}

                              {

                                venta.productos
                                  .length === 0

                                  ? (

                                    <div

                                      style={{

                                        color:
                                          "#6b7280",

                                        fontSize:
                                          "14px",

                                        padding:
                                          "10px 0",

                                      }}

                                    >

                                      No se encontraron
                                      productos para esta venta.

                                    </div>

                                  )

                                  : (

                                    venta.productos.map(

                                      (
                                        producto
                                      ) => (

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

                                            padding:
                                              "10px 0",

                                            borderBottom:
                                              "1px solid #e5e7eb",

                                          }}

                                        >


                                          {/* PRODUCTO */}

                                          <div>

                                            <strong>

                                              {
                                                producto.nombreProducto
                                              }

                                            </strong>


                                            <div

                                              style={{

                                                color:
                                                  "#6b7280",

                                                fontSize:
                                                  "13px",

                                                marginTop:
                                                  "4px",

                                              }}

                                            >

                                              {
                                                formatoCOP(
                                                  producto.precio
                                                )
                                              }

                                              {" × "}

                                              {
                                                producto.cantidad
                                              }

                                            </div>

                                          </div>


                                          {/* SUBTOTAL */}

                                          <strong

                                            style={{

                                              color:
                                                "#166534",

                                            }}

                                          >

                                            {
                                              formatoCOP(

                                                producto.subtotal

                                              )
                                            }

                                          </strong>


                                        </div>

                                      )

                                    )

                                  )

                              }


                              {/* ========================= */}
                              {/* TOTAL */}
                              {/* ========================= */}

                              <div

                                style={{

                                  display:
                                    "flex",

                                  justifyContent:
                                    "space-between",

                                  marginTop:
                                    "15px",

                                  paddingTop:
                                    "15px",

                                  borderTop:
                                    "2px solid #d1d5db",

                                }}

                              >

                                <strong>

                                  TOTAL DE LA VENTA

                                </strong>


                                <strong

                                  style={{

                                    color:
                                      "#16a34a",

                                    fontSize:
                                      "18px",

                                  }}

                                >

                                  {
                                    formatoCOP(
                                      venta.total
                                    )
                                  }

                                </strong>

                              </div>


                            </div>

                          )

                        }


                      </div>

                    );

                  }

                )

              )

          }


        </div>


        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <div
          className="ventas-modal-footer"
        >

          <span>

            TOTAL DEL USUARIO

          </span>


          <strong>

            {
              formatoCOP(
                resumen.totalVentas
              )
            }

          </strong>

        </div>


      </div>

    </div>

  );

}