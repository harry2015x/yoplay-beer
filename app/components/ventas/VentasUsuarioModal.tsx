"use client";

import { useState } from "react";

import type {
  ProductoVenta,
  ResumenVentasUsuario,
  VentaDetalle,
} from "../../../types/ventas";


// ============================================================
// PROPS
// ============================================================

type Props = {
  resumen: ResumenVentasUsuario;

  onCerrar: () => void;
};


// ============================================================
// FORMATO MONEDA
// ============================================================

function formatoCOP(valor: number): string {

  return Number(valor || 0).toLocaleString(
    "es-CO",
    {
      style: "currency",

      currency: "COP",

      minimumFractionDigits: 0,

      maximumFractionDigits: 0,
    }
  );

}


// ============================================================
// FORMATO HORA
// ============================================================

function formatoHora(
  fecha: string | Date | null | undefined
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
      hour: "2-digit",

      minute: "2-digit",

      hour12: true,
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
  // ESTADO
  // ==========================================================

  const [
    ventaSeleccionada,
    setVentaSeleccionada,
  ] = useState<number | null>(
    null
  );


  // ==========================================================
  // ABRIR / CERRAR DETALLE
  // ==========================================================

  function toggleVenta(
    ventaId: number
  ) {

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

  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div
      className="
        ventas-modal-overlay
      "
      onClick={onCerrar}
    >

      <div
        className="
          ventas-modal
        "
        onClick={
          (event) => {

            event.stopPropagation();

          }
        }
      >


        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div
          className="
            ventas-modal-header
          "
        >

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
              }

              {" "}

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

            className="
              ventas-modal-close
            "

            aria-label="
              Cerrar
            "
          >

            ✕

          </button>

        </div>


        {/* ================================================= */}
        {/* LISTA DE VENTAS */}
        {/* ================================================= */}

        <div
          className="
            ventas-lista
          "
        >


          {/* ================================================= */}
          {/* SIN VENTAS */}
          {/* ================================================= */}

          {
            resumen.ventas.length === 0
              ? (

                <div
                  className="
                    ventas-vacias
                  "
                >

                  No hay ventas registradas para este usuario.

                </div>

              )
              : (


                resumen.ventas.map(

                  (
                    venta: VentaDetalle
                  ) => {


                    const estaAbierta =
                      ventaSeleccionada ===
                      venta.id;


                    return (

                      <div
                        key={venta.id}

                        style={{

                          border:
                            "1px solid #e5e7eb",

                          borderRadius:
                            "10px",

                          marginBottom:
                            "12px",

                          overflow:
                            "hidden",

                          background:
                            "white",

                        }}
                      >


                        {/* ===================================== */}
                        {/* CABECERA DE LA VENTA */}
                        {/* ===================================== */}

                        <button
                          type="button"

                          onClick={
                            () => {

                              toggleVenta(
                                venta.id
                              );

                            }
                          }

                          style={{

                            width:
                              "100%",

                            border:
                              "none",

                            background:
                              estaAbierta
                                ? "#f3f4f6"
                                : "white",

                            padding:
                              "16px",

                            cursor:
                              "pointer",

                            display:
                              "flex",

                            alignItems:
                              "center",

                            justifyContent:
                              "space-between",

                            textAlign:
                              "left",

                          }}
                        >


                          {/* IZQUIERDA */}

                          <div>


                            <div
                              style={{

                                fontWeight:
                                  700,

                                marginBottom:
                                  "5px",

                              }}
                            >

                              🪑 Mesa{" "}

                              {
                                venta.mesaNumero
                                ?? "-"
                              }

                            </div>


                            <div
                              style={{

                                fontSize:
                                  "13px",

                                color:
                                  "#6b7280",

                              }}
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

                          </div>


                          {/* DERECHA */}

                          <div
                            style={{

                              display:
                                "flex",

                              alignItems:
                                "center",

                              gap:
                                "12px",

                            }}
                          >


                            {/* TOTAL */}

                            <strong
                              style={{

                                color:
                                  "#16a34a",

                                fontSize:
                                  "16px",

                              }}
                            >

                              {
                                formatoCOP(
                                  venta.total
                                )
                              }

                            </strong>


                            {/* FLECHA */}

                            <span
                              style={{

                                fontSize:
                                  "18px",

                                color:
                                  "#6b7280",

                              }}
                            >

                              {
                                estaAbierta
                                  ? "▲"
                                  : "▼"
                              }

                            </span>


                          </div>

                        </button>


                        {/* ===================================== */}
                        {/* DETALLE DE PRODUCTOS */}
                        {/* ===================================== */}

                        {
                          estaAbierta && (

                            <div
                              style={{

                                padding:
                                  "16px",

                                borderTop:
                                  "1px solid #e5e7eb",

                                background:
                                  "#fafafa",

                              }}
                            >


                              {/* ================================= */}
                              {/* TITULO */}
                              {/* ================================= */}

                              <h4
                                style={{

                                  margin:
                                    "0 0 15px 0",

                                  color:
                                    "#374151",

                                  fontSize:
                                    "14px",

                                }}
                              >

                                🍺 PRODUCTOS VENDIDOS

                              </h4>


                              {/* ================================= */}
                              {/* SIN PRODUCTOS */}
                              {/* ================================= */}

                              {
                                !venta.productos
                                ||

                                venta.productos.length === 0

                                  ? (

                                    <div
                                      style={{

                                        padding:
                                          "15px",

                                        background:
                                          "#fff7ed",

                                        borderRadius:
                                          "8px",

                                        color:
                                          "#9a3412",

                                        fontSize:
                                          "14px",

                                      }}
                                    >

                                      ⚠️ No hay productos registrados
                                      para esta venta.

                                    </div>

                                  )

                                  : (


                                    <div>


                                      {/* ========================= */}
                                      {/* PRODUCTOS */}
                                      {/* ========================= */}

                                      {
                                        venta.productos.map(

                                          (
                                            producto:
                                              ProductoVenta
                                          ) => (

                                            <div
                                              key={
                                                producto.id
                                              }

                                              style={{

                                                padding:
                                                  "12px 0",

                                                borderBottom:
                                                  "1px solid #e5e7eb",

                                              }}
                                            >


                                              {/* FILA PRINCIPAL */}

                                              <div
                                                style={{

                                                  display:
                                                    "flex",

                                                  justifyContent:
                                                    "space-between",

                                                  gap:
                                                    "15px",

                                                }}
                                              >


                                                {/* NOMBRE */}

                                                <div
                                                  style={{

                                                    flex:
                                                      1,

                                                  }}
                                                >

                                                  <strong
                                                    style={{

                                                      color:
                                                        "#111827",

                                                    }}
                                                  >

                                                    🍺{" "}

                                                    {
                                                      producto
                                                        .nombreProducto
                                                    }

                                                  </strong>


                                                  <div
                                                    style={{

                                                      marginTop:
                                                        "5px",

                                                      fontSize:
                                                        "13px",

                                                      color:
                                                        "#6b7280",

                                                    }}
                                                  >

                                                    {
                                                      formatoCOP(
                                                        producto.precio
                                                      )
                                                    }

                                                    {" "}

                                                    ×

                                                    {" "}

                                                    {
                                                      producto.cantidad
                                                    }

                                                  </div>

                                                </div>


                                                {/* SUBTOTAL */}

                                                <strong
                                                  style={{

                                                    color:
                                                      "#16a34a",

                                                    whiteSpace:
                                                      "nowrap",

                                                  }}
                                                >

                                                  {
                                                    formatoCOP(
                                                      producto.subtotal
                                                    )
                                                  }

                                                </strong>


                                              </div>

                                            </div>

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

                                          alignItems:
                                            "center",

                                          paddingTop:
                                            "16px",

                                          marginTop:
                                            "5px",

                                          fontWeight:
                                            700,

                                          fontSize:
                                            "16px",

                                        }}
                                      >

                                        <span>

                                          TOTAL DE LA VENTA

                                        </span>


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
          className="
            ventas-modal-footer
          "
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