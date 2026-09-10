"use client";

import {
  useState,
} from "react";

import type {
  VentaDetalle,
  ProductoVenta,
} from "../../../types/ventas";


// ============================================================
// TIPO DEL RESUMEN
// ============================================================

export type ResumenVentasUsuario = {

  usuarioId:
    string | null;

  usuarioNombre:
    string;

  cantidadVentas:
    number;

  totalVentas:
    number;

  ventas:
    VentaDetalle[];

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
// FORMATO COP
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
    | string
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
  // CLICK EN VENTA
  // ==========================================================

  const seleccionarVenta = (
    ventaId: number
  ) => {


    setVentaSeleccionada(
      (actual) => {


        if (
          actual === ventaId
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

        <div
          className="ventas-modal-header"
        >


          <div>


            <h2>

              💰 VENTAS DE{" "}

              {resumen.usuarioNombre.toUpperCase()}

            </h2>


            <p>

              {resumen.cantidadVentas}{" "}

              {resumen.cantidadVentas === 1
                ? "venta realizada"
                : "ventas realizadas"}

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
        {/* INSTRUCCIÓN */}
        {/* ================================================= */}

        <div
          style={{

            marginBottom:
              "15px",

            color:
              "#6b7280",

            fontSize:
              "14px",

          }}
        >

          👆 Haz clic sobre una venta para ver los productos.

        </div>


        {/* ================================================= */}
        {/* LISTA DE VENTAS */}
        {/* ================================================= */}

        <div
          className="ventas-lista"
        >


          {resumen.ventas.length === 0 ? (


            <div
              className="ventas-vacias"
            >

              No hay ventas registradas para este usuario.

            </div>


          ) : (


            resumen.ventas.map(
              (
                venta:
                  VentaDetalle
              ) => {


                const estaAbierta =
                  ventaSeleccionada ===
                  venta.id;


                return (


                  <div
                    key={venta.id}
                    style={{

                      borderBottom:
                        "1px solid #e5e7eb",

                    }}
                  >


                    {/* ===================================== */}
                    {/* CABECERA DE LA VENTA */}
                    {/* ===================================== */}

                    <div
                      className="venta-item"
                      onClick={
                        () =>
                          seleccionarVenta(
                            venta.id
                          )
                      }
                      style={{

                        cursor:
                          "pointer",

                        userSelect:
                          "none",

                      }}
                    >


                      {/* HORA */}

                      <div
                        className="venta-hora"
                      >

                        ⏰{" "}

                        {formatoHora(

                          venta.closedAt
                            ??
                          venta.createdAt

                        )}

                      </div>


                      {/* MESA */}

                      <div
                        className="venta-mesa"
                      >

                        🪑 Mesa{" "}

                        {venta.mesaNumero
                          ?? "-"}

                      </div>


                      {/* TOTAL */}

                      <div
                        className="venta-total"
                      >

                        {formatoCOP(
                          venta.total
                        )}

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

                        {estaAbierta
                          ? "▲"
                          : "▼"}

                      </div>


                    </div>


                    {/* ===================================== */}
                    {/* DETALLE DE PRODUCTOS */}
                    {/* ===================================== */}

                    {estaAbierta && (


                      <div
                        style={{

                          background:
                            "#f8fafc",

                          borderRadius:
                            "10px",

                          padding:
                            "15px",

                          margin:
                            "0 0 15px 0",

                          border:
                            "1px solid #e5e7eb",

                        }}
                      >


                        {/* TÍTULO */}

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

                          🧾 PRODUCTOS DE LA VENTA

                        </div>


                        {/* SIN PRODUCTOS */}

                        {venta.productos.length === 0 ? (


                          <div
                            style={{

                              color:
                                "#6b7280",

                              padding:
                                "10px 0",

                            }}
                          >

                            ⚠️ Esta venta no tiene productos registrados.

                          </div>


                        ) : (


                          venta.productos.map(
                            (
                              producto:
                                ProductoVenta
                            ) => (


                              <div
                                key={producto.id}
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


                                {/* INFORMACIÓN */}

                                <div>


                                  <strong>

                                    {producto.nombreProducto}

                                  </strong>


                                  <div
                                    style={{

                                      fontSize:
                                        "13px",

                                      color:
                                        "#6b7280",

                                      marginTop:
                                        "3px",

                                    }}
                                  >

                                    {formatoCOP(
                                      producto.precio
                                    )}

                                    {" "}×{" "}

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

                                  {formatoCOP(
                                    producto.subtotal
                                  )}

                                </strong>


                              </div>


                            )
                          )


                        )}


                        {/* TOTAL */}

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

                            fontWeight:
                              700,

                          }}
                        >


                          <span>

                            TOTAL

                          </span>


                          <span
                            style={{

                              color:
                                "#16a34a",

                            }}
                          >

                            {formatoCOP(
                              venta.total
                            )}

                          </span>


                        </div>


                      </div>


                    )}


                  </div>


                );

              }
            )


          )}


        </div>


        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <div
          className="ventas-modal-footer"
        >


          <div>


            <span>

              TOTAL DEL USUARIO

            </span>


            <small
              style={{

                display:
                  "block",

                marginTop:
                  "5px",

              }}
            >

              {resumen.cantidadVentas}{" "}

              {resumen.cantidadVentas === 1
                ? "venta realizada"
                : "ventas realizadas"}

            </small>


          </div>


          <strong>

            {formatoCOP(
              resumen.totalVentas
            )}

          </strong>


        </div>


      </div>


    </div>

  );

}