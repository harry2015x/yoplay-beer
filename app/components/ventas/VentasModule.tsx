"use client";

import { useMemo, useState } from "react";

import type {
  PerfilUsuario,
} from "../../../hooks/useAuth";

import type {
  ResumenVentasUsuario,
  VentaDetalle,
} from "../../../types/ventas";

import VentasUsuarioModal from "./VentasUsuarioModal";


// ============================================================
// PROPS
// ============================================================

type Props = {

  ventas: VentaDetalle[];

  resumenUsuarios: ResumenVentasUsuario[];

  cargando: boolean;

  error: string | null;

  cargarVentas: () => Promise<void>;

  limpiarError: () => void;

  perfilActual: PerfilUsuario;

  esAdministrador: boolean;

};


// ============================================================
// FORMATO MONEDA
// ============================================================

function formatoCOP(
  valor: number
): string {

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
// COMPONENTE PRINCIPAL
// ============================================================

export default function VentasModule({

  ventas,

  resumenUsuarios,

  cargando,

  error,

  cargarVentas,

  limpiarError,

  perfilActual,

  esAdministrador,

}: Props) {


  // ==========================================================
  // USUARIO SELECCIONADO
  // ==========================================================

  const [

    usuarioSeleccionado,

    setUsuarioSeleccionado,

  ] = useState<
    ResumenVentasUsuario | null
  >(null);


  // ==========================================================
  // FILTRAR VENTAS
  //
  // ADMINISTRADOR:
  // Ve todas las ventas.
  //
  // VENDEDOR:
  // Solo ve sus propias ventas.
  // ==========================================================

  const ventasVisibles = useMemo(
    () => {

      if (esAdministrador) {

        return ventas;

      }


      return ventas.filter(
        (venta) =>

          venta.usuarioId ===
          perfilActual.id
      );

    },
    [

      ventas,

      esAdministrador,

      perfilActual.id,

    ]
  );


  // ==========================================================
  // RESUMEN DE USUARIOS VISIBLE
  // ==========================================================

  const resumenVisible = useMemo(
    () => {

      if (esAdministrador) {

        return resumenUsuarios;

      }


      return resumenUsuarios.filter(
        (resumen) =>

          resumen.usuarioId ===
          perfilActual.id
      );

    },
    [

      resumenUsuarios,

      esAdministrador,

      perfilActual.id,

    ]
  );


  // ==========================================================
  // TOTAL DEL DÍA
  // ==========================================================

  const totalDelDia = useMemo(
    () => {

      return ventasVisibles.reduce(
        (
          total,
          venta
        ) => {

          return (
            total +
            Number(
              venta.total || 0
            )
          );

        },
        0
      );

    },
    [

      ventasVisibles,

    ]
  );


  // ==========================================================
  // CANTIDAD DE VENTAS
  // ==========================================================

  const cantidadVentas =

    ventasVisibles.length;


  // ==========================================================
  // RECARGAR
  // ==========================================================

  async function manejarRecargar() {

    await cargarVentas();

  }


  // ==========================================================
  // ABRIR DETALLE
  // ==========================================================

  function abrirDetalle(

    resumen:
      ResumenVentasUsuario

  ) {

    setUsuarioSeleccionado(
      resumen
    );

  }


  // ==========================================================
  // CERRAR DETALLE
  // ==========================================================

  function cerrarDetalle() {

    setUsuarioSeleccionado(
      null
    );

  }


  // ==========================================================
  // MODAL DETALLE
  // ==========================================================

  if (
    usuarioSeleccionado
  ) {

    return (

      <VentasUsuarioModal

        resumen={
          usuarioSeleccionado
        }

        onCerrar={
          cerrarDetalle
        }

      />

    );

  }


  // ==========================================================
  // RENDER PRINCIPAL
  // ==========================================================

  return (

    <div>


      {/* ==================================================== */}
      {/* ENCABEZADO */}
      {/* ==================================================== */}

      <div
        style={{

          display:
            "flex",

          justifyContent:
            "space-between",

          alignItems:
            "flex-start",

          gap:
            "20px",

          flexWrap:
            "wrap",

          marginBottom:
            "25px",

        }}
      >


        {/* TÍTULO */}

        <div>

          <h2
            style={{

              margin:
                "0 0 5px",

              color:
                "#172131",

            }}
          >
            💰 Ventas
          </h2>


          <p
            style={{

              margin:
                0,

              color:
                "#6b7280",

            }}
          >

            {

              esAdministrador

                ? "Registro diario de ventas por usuario."

                : "Registro de tus ventas realizadas hoy."

            }

          </p>

        </div>


        {/* BOTÓN ACTUALIZAR */}

        <button

          onClick={
            manejarRecargar
          }

          disabled={
            cargando
          }

          style={{

            background:

              cargando
                ? "#94a3b8"
                : "#172131",

            color:
              "white",

            border:
              "none",

            borderRadius:
              "8px",

            padding:
              "11px 16px",

            cursor:

              cargando
                ? "not-allowed"
                : "pointer",

            fontWeight:
              700,

          }}

        >

          {

            cargando

              ? "⏳ Cargando..."

              : "🔄 Actualizar"

          }

        </button>

      </div>


      {/* ==================================================== */}
      {/* ERROR */}
      {/* ==================================================== */}

      {

        error && (

          <div
            style={{

              background:
                "#fee2e2",

              border:
                "1px solid #fecaca",

              color:
                "#991b1b",

              padding:
                "15px",

              borderRadius:
                "8px",

              marginBottom:
                "20px",

              display:
                "flex",

              justifyContent:
                "space-between",

              alignItems:
                "center",

              gap:
                "15px",

            }}
          >

            <span>
              ⚠️ {error}
            </span>


            <button

              onClick={
                limpiarError
              }

              style={{

                border:
                  "none",

                background:
                  "transparent",

                cursor:
                  "pointer",

                fontWeight:
                  700,

                color:
                  "#991b1b",

              }}

            >
              ✕
            </button>

          </div>

        )

      }


      {/* ==================================================== */}
      {/* RESUMEN GENERAL */}
      {/* ==================================================== */}

      <div
        style={{

          background:
            "#172131",

          padding:
            "25px",

          borderRadius:
            "12px",

          boxShadow:
            "0 4px 12px rgba(0,0,0,0.12)",

          marginBottom:
            "25px",

          color:
            "white",

          display:
            "flex",

          justifyContent:
            "space-between",

          alignItems:
            "center",

          gap:
            "20px",

          flexWrap:
            "wrap",

        }}
      >


        {/* TOTAL */}

        <div>

          <div
            style={{

              color:
                "#b0bac8",

              fontSize:
                "13px",

              marginBottom:
                "8px",

              textTransform:
                "uppercase",

              letterSpacing:
                "1px",

            }}
          >
            💰 Total vendido hoy
          </div>


          <strong
            style={{

              fontSize:
                "32px",

              color:
                "#f59e0b",

            }}
          >

            {
              formatoCOP(
                totalDelDia
              )
            }

          </strong>

        </div>


        {/* CANTIDAD */}

        <div
          style={{

            background:
              "#263344",

            padding:
              "12px 18px",

            borderRadius:
              "8px",

            textAlign:
              "right",

          }}
        >

          <strong
            style={{

              display:
                "block",

              fontSize:
                "20px",

            }}
          >

            {
              cantidadVentas
            }

          </strong>


          <span
            style={{

              color:
                "#b0bac8",

              fontSize:
                "12px",

            }}
          >

            {

              cantidadVentas === 1

                ? "venta realizada"

                : "ventas realizadas"

            }

          </span>

        </div>

      </div>


      {/* ==================================================== */}
      {/* CONTENEDOR */}
      {/* ==================================================== */}

      <div
        style={{

          background:
            "white",

          padding:
            "30px",

          borderRadius:
            "12px",

          boxShadow:
            "0 2px 10px rgba(0,0,0,0.08)",

        }}
      >


        {/* ================================================== */}
        {/* TÍTULO */}
        {/* ================================================== */}

        <h3
          style={{

            marginTop:
              0,

            marginBottom:
              "8px",

            color:
              "#172131",

          }}
        >

          👥

          {" "}

          {

            esAdministrador

              ? "Ventas por usuario"

              : "Mis ventas"

          }

        </h3>


        <p
          style={{

            color:
              "#6b7280",

            fontSize:
              "14px",

            marginBottom:
              "25px",

          }}
        >

          {

            esAdministrador

              ? "Selecciona un usuario para ver sus ventas y los productos vendidos."

              : "Selecciona tu registro para ver el detalle de tus ventas."

          }

        </p>


        {/* ================================================== */}
        {/* CARGANDO */}
        {/* ================================================== */}

        {

          cargando && (

            <div
              style={{

                textAlign:
                  "center",

                padding:
                  "40px",

                color:
                  "#6b7280",

              }}
            >

              ⏳ Cargando ventas...

            </div>

          )

        }


        {/* ================================================== */}
        {/* SIN VENTAS */}
        {/* ================================================== */}

        {

          !cargando &&

          resumenVisible.length === 0 && (

            <div
              style={{

                textAlign:
                  "center",

                padding:
                  "40px 20px",

                color:
                  "#6b7280",

              }}
            >

              <div
                style={{

                  fontSize:
                    "40px",

                  marginBottom:
                    "12px",

                }}
              >
                💰
              </div>


              <strong>
                Todavía no hay ventas hoy.
              </strong>


              <p
                style={{

                  marginTop:
                    "8px",

                  fontSize:
                    "13px",

                }}
              >

                Las ventas aparecerán aquí
                cuando se cierre una mesa.

              </p>

            </div>

          )

        }


        {/* ================================================== */}
        {/* LISTA DE USUARIOS */}
        {/* ================================================== */}

        {

          !cargando &&

          resumenVisible.map(

            (resumen) => (

              <button

                key={
                  resumen.usuarioId ??
                  "sin-usuario"
                }

                type="button"

                onClick={() =>
                  abrirDetalle(
                    resumen
                  )
                }

                style={{

                  width:
                    "100%",

                  display:
                    "flex",

                  justifyContent:
                    "space-between",

                  alignItems:
                    "center",

                  gap:
                    "20px",

                  padding:
                    "18px",

                  marginBottom:
                    "12px",

                  background:
                    "#f8fafc",

                  border:
                    "1px solid #e2e8f0",

                  borderRadius:
                    "10px",

                  cursor:
                    "pointer",

                  textAlign:
                    "left",

                }}

              >


                {/* USUARIO */}

                <div>

                  <strong
                    style={{

                      display:
                        "block",

                      color:
                        "#172131",

                      fontSize:
                        "16px",

                    }}
                  >

                    👤

                    {" "}

                    {
                      resumen.usuarioNombre
                    }

                  </strong>


                  <span
                    style={{

                      color:
                        "#6b7280",

                      fontSize:
                        "13px",

                      marginTop:
                        "5px",

                      display:
                        "block",

                    }}
                  >

                    {
                      resumen.cantidadVentas
                    }

                    {" "}

                    {

                      resumen.cantidadVentas === 1

                        ? "venta"

                        : "ventas"

                    }

                    {" • "}

                    Ver detalle →

                  </span>

                </div>


                {/* TOTAL */}

                <strong
                  style={{

                    color:
                      "#16a34a",

                    fontSize:
                      "18px",

                    whiteSpace:
                      "nowrap",

                  }}
                >

                  {
                    formatoCOP(
                      resumen.totalVentas
                    )
                  }

                </strong>

              </button>

            )

          )

        }


        {/* ================================================== */}
        {/* TOTAL FINAL */}
        {/* ================================================== */}

        {

          !cargando &&

          cantidadVentas > 0 && (

            <div
              style={{

                marginTop:
                  "25px",

                paddingTop:
                  "20px",

                borderTop:
                  "2px solid #e5e7eb",

                display:
                  "flex",

                justifyContent:
                  "space-between",

                alignItems:
                  "center",

                flexWrap:
                  "wrap",

                gap:
                  "15px",

              }}
            >

              <div>

                <strong
                  style={{

                    color:
                      "#172131",

                  }}
                >

                  {

                    esAdministrador

                      ? "TOTAL DE VENTAS DEL DÍA"

                      : "TOTAL DE MIS VENTAS"

                  }

                </strong>


                <div
                  style={{

                    fontSize:
                      "12px",

                    color:
                      "#6b7280",

                    marginTop:
                      "5px",

                  }}
                >

                  {
                    cantidadVentas
                  }

                  {" "}

                  {

                    cantidadVentas === 1

                      ? "venta registrada"

                      : "ventas registradas"

                  }

                </div>

              </div>


              <strong
                style={{

                  color:
                    "#16a34a",

                  fontSize:
                    "25px",

                }}
              >

                {
                  formatoCOP(
                    totalDelDia
                  )
                }

              </strong>

            </div>

          )

        }

      </div>

    </div>

  );

}