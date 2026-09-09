"use client";

import { useEffect, useMemo, useState } from "react";

import { supabase } from "../../../lib/supabase";

import type {
  PerfilUsuario,
} from "../../../hooks/useAuth";

import type {
  Venta,
} from "../../../types/mesas";

import {
  formatoCOP,
} from "../../../types/mesas";


// ============================================================
// TIPOS
// ============================================================

type Props = {
  ventas: Venta[];

  perfilActual: PerfilUsuario;

  esAdministrador: boolean;
};


type GrupoVentas = {
  usuarioId: string | null;

  nombre: string;

  ventas: Venta[];

  total: number;
};


// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function VentasModule({
  ventas,
  perfilActual,
  esAdministrador,
}: Props) {

  // ==========================================================
  // ESTADOS
  // ==========================================================

  const [perfiles, setPerfiles] =
    useState<PerfilUsuario[]>([]);

  const [cargandoUsuarios, setCargandoUsuarios] =
    useState(false);

  const [usuarioSeleccionado, setUsuarioSeleccionado] =
    useState<GrupoVentas | null>(null);


  // ==========================================================
  // CARGAR USUARIOS
  // ==========================================================

  useEffect(() => {

    async function cargarUsuarios() {

      // Los vendedores no necesitan cargar
      // todos los perfiles.
      if (!esAdministrador) {
        return;
      }

      setCargandoUsuarios(true);

      const { data, error } =
        await supabase
          .from("profiles")
          .select("*")
          .order("nombre", {
            ascending: true,
          });

      if (error) {

        console.error(
          "Error cargando usuarios:",
          error.message
        );

        setPerfiles([]);

      } else {

        setPerfiles(
          (data ?? []) as PerfilUsuario[]
        );

      }

      setCargandoUsuarios(false);
    }


    cargarUsuarios();

  }, [esAdministrador]);


  // ==========================================================
  // FUNCIÓN:
  // ¿LA VENTA ES DE HOY?
  // ==========================================================

  function esVentaDeHoy(
    fecha: Date
  ) {

    const hoy = new Date();

    const fechaVenta =
      new Date(fecha);

    return (
      fechaVenta.getFullYear() ===
        hoy.getFullYear() &&

      fechaVenta.getMonth() ===
        hoy.getMonth() &&

      fechaVenta.getDate() ===
        hoy.getDate()
    );
  }


  // ==========================================================
  // VENTAS DEL DÍA
  // ==========================================================

  const ventasHoy = useMemo(() => {

    return ventas.filter((venta) =>
      esVentaDeHoy(venta.fecha)
    );

  }, [ventas]);


  // ==========================================================
  // VENTAS VISIBLES
  //
  // ADMINISTRADOR:
  // ve todas.
  //
  // VENDEDOR:
  // ve únicamente las suyas.
  // ==========================================================

  const ventasVisibles = useMemo(() => {

    if (esAdministrador) {
      return ventasHoy;
    }

    return ventasHoy.filter(
      (venta) =>
        venta.usuarioId === perfilActual.id
    );

  }, [
    ventasHoy,
    esAdministrador,
    perfilActual.id,
  ]);


  // ==========================================================
  // OBTENER NOMBRE DEL USUARIO
  // ==========================================================

  function obtenerNombreUsuario(
    usuarioId: string | null
  ) {

    // ----------------------------------------
    // VENTAS ANTIGUAS
    // ----------------------------------------

    if (!usuarioId) {
      return "Sin usuario asignado";
    }


    // ----------------------------------------
    // USUARIO ACTUAL
    // ----------------------------------------

    if (
      usuarioId === perfilActual.id
    ) {

      return (
        perfilActual.nombre ||
        perfilActual.email ||
        "Usuario"
      );

    }


    // ----------------------------------------
    // BUSCAR PERFIL
    // ----------------------------------------

    const perfil =
      perfiles.find(
        (item) =>
          item.id === usuarioId
      );


    if (perfil) {

      return (
        perfil.nombre ||
        perfil.email ||
        "Usuario"
      );

    }


    return "Usuario desconocido";
  }


  // ==========================================================
  // AGRUPAR VENTAS POR USUARIO
  // ==========================================================

  const gruposVentas = useMemo(() => {

    const grupos =
      new Map<
        string,
        GrupoVentas
      >();


    ventasVisibles.forEach(
      (venta) => {

        const clave =
          venta.usuarioId ??
          "sin_usuario";


        if (!grupos.has(clave)) {

          grupos.set(
            clave,
            {
              usuarioId:
                venta.usuarioId,

              nombre:
                obtenerNombreUsuario(
                  venta.usuarioId
                ),

              ventas: [],

              total: 0,
            }
          );

        }


        const grupo =
          grupos.get(clave)!;


        grupo.ventas.push(venta);


        grupo.total +=
          venta.total;

      }
    );


    return Array.from(
      grupos.values()
    ).sort(
      (a, b) =>
        b.total - a.total
    );

  }, [
    ventasVisibles,
    perfiles,
    perfilActual,
  ]);


  // ==========================================================
  // TOTAL DEL DÍA
  // ==========================================================

  const totalDelDia =
    ventasVisibles.reduce(
      (total, venta) =>
        total + venta.total,
      0
    );


  // ==========================================================
  // FORMATEAR HORA
  // ==========================================================

  function formatearHora(
    fecha: Date
  ) {

    return new Intl.DateTimeFormat(
      "es-CO",
      {
        hour: "numeric",

        minute: "2-digit",

        hour12: true,
      }
    ).format(
      new Date(fecha)
    );

  }


  // ==========================================================
  // ORDENAR VENTAS
  // CRONOLÓGICAMENTE
  // ==========================================================

  const ventasOrdenadas =
    usuarioSeleccionado
      ? [...usuarioSeleccionado.ventas]
          .sort(
            (a, b) =>
              new Date(
                a.fecha
              ).getTime()
              -
              new Date(
                b.fecha
              ).getTime()
          )
      : [];


  // ==========================================================
  // VISTA DETALLE DEL USUARIO
  // ==========================================================

  if (usuarioSeleccionado) {

    return (

      <div
        style={{
          background: "white",

          padding: "30px",

          borderRadius: "12px",

          boxShadow:
            "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >

        {/* ================================================ */}
        {/* BOTÓN VOLVER */}
        {/* ================================================ */}

        <button
          onClick={() =>
            setUsuarioSeleccionado(null)
          }
          style={{
            border: "none",

            background:
              "#f1f5f9",

            padding:
              "10px 16px",

            borderRadius:
              "8px",

            cursor:
              "pointer",

            marginBottom:
              "25px",

            fontWeight: 600,

            color:
              "#334155",
          }}
        >
          ← Volver a ventas
        </button>


        {/* ================================================ */}
        {/* ENCABEZADO */}
        {/* ================================================ */}

        <div
          style={{
            marginBottom:
              "30px",
          }}
        >

          <div
            style={{
              fontSize:
                "13px",

              color:
                "#6b7280",

              marginBottom:
                "8px",

              textTransform:
                "uppercase",

              letterSpacing:
                "1px",
            }}
          >
            Ventas del día
          </div>


          <h2
            style={{
              margin: 0,

              fontSize:
                "26px",

              color:
                "#172131",
            }}
          >
            👤 VENTAS DE{" "}

            {
              usuarioSeleccionado.nombre
                .toUpperCase()
            }

          </h2>


          <p
            style={{
              color:
                "#6b7280",

              marginTop:
                "10px",
            }}
          >

            {
              usuarioSeleccionado
                .ventas
                .length
            }{" "}

            {
              usuarioSeleccionado
                .ventas
                .length === 1
                ? "venta realizada"
                : "ventas realizadas"
            }

          </p>

        </div>


        {/* ================================================ */}
        {/* LISTA DE VENTAS */}
        {/* ================================================ */}

        <div>

          {ventasOrdenadas.map(
            (venta) => (

              <div
                key={venta.id}

                style={{
                  display:
                    "flex",

                  justifyContent:
                    "space-between",

                  alignItems:
                    "center",

                  padding:
                    "18px 0",

                  borderBottom:
                    "1px solid #e5e7eb",
                }}
              >

                {/* INFORMACIÓN */}

                <div
                  style={{
                    display:
                      "flex",

                    alignItems:
                      "center",

                    gap:
                      "15px",
                  }}
                >

                  {/* HORA */}

                  <div
                    style={{
                      width:
                        "80px",

                      fontSize:
                        "14px",

                      fontWeight:
                        700,

                      color:
                        "#475569",
                    }}
                  >
                    ⏰{" "}

                    {
                      formatearHora(
                        venta.fecha
                      )
                    }

                  </div>


                  {/* MESA */}

                  <div>

                    <strong
                      style={{
                        color:
                          "#172131",
                      }}
                    >
                      🪑 Mesa{" "}

                      {
                        venta.mesaNumero
                      }

                    </strong>


                    <div
                      style={{
                        marginTop:
                          "4px",

                        fontSize:
                          "12px",

                        color:
                          "#6b7280",
                      }}
                    >
                      Venta registrada
                    </div>

                  </div>

                </div>


                {/* TOTAL */}

                <strong
                  style={{
                    color:
                      "#16a34a",

                    fontSize:
                      "17px",
                  }}
                >
                  {
                    formatoCOP(
                      venta.total
                    )
                  }
                </strong>

              </div>

            )
          )}

        </div>


        {/* ================================================ */}
        {/* TOTAL USUARIO */}
        {/* ================================================ */}

        <div
          style={{
            marginTop:
              "30px",

            padding:
              "25px",

            background:
              "#172131",

            borderRadius:
              "12px",

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

          <div>

            <div
              style={{
                fontSize:
                  "13px",

                color:
                  "#b0bac8",

                marginBottom:
                  "7px",

                textTransform:
                  "uppercase",

                letterSpacing:
                  "1px",
              }}
            >
              Total del usuario
            </div>


            <div
              style={{
                fontSize:
                  "13px",

                color:
                  "#b0bac8",
              }}
            >

              {
                usuarioSeleccionado
                  .ventas
                  .length
              }{" "}

              ventas realizadas

            </div>

          </div>


          <strong
            style={{
              fontSize:
                "28px",

              color:
                "#f59e0b",
            }}
          >
            {
              formatoCOP(
                usuarioSeleccionado
                  .total
              )
            }
          </strong>

        </div>

      </div>

    );

  }


  // ==========================================================
  // VISTA PRINCIPAL
  // ==========================================================

  return (

    <div>

      {/* ==================================================== */}
      {/* ENCABEZADO */}
      {/* ==================================================== */}

      <div
        style={{
          marginBottom:
            "25px",
        }}
      >

        <h2
          style={{
            marginBottom:
              "5px",
          }}
        >
          💰 Ventas
        </h2>


        <p
          style={{
            color:
              "#6b7280",

            margin: 0,
          }}
        >

          {
            esAdministrador
              ? "Registro diario de ventas por usuario."
              : "Registro de tus ventas realizadas hoy."
          }

        </p>

      </div>


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
              ventasVisibles.length
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
              ventasVisibles.length === 1
                ? "venta realizada"
                : "ventas realizadas"
            }

          </span>

        </div>

      </div>


      {/* ==================================================== */}
      {/* VENTAS POR USUARIO */}
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

        {/* TÍTULO */}

        <h3
          style={{
            marginTop: 0,

            marginBottom:
              "8px",

            color:
              "#172131",
          }}
        >

          👥{" "}

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
              ? "Selecciona un usuario para ver el detalle cronológico de sus ventas."
              : "Selecciona tu registro para ver el detalle cronológico de tus ventas."
          }

        </p>


        {/* ================================================ */}
        {/* CARGANDO USUARIOS */}
        {/* ================================================ */}

        {
          cargandoUsuarios &&
          esAdministrador && (

            <div
              style={{
                color:
                  "#6b7280",

                padding:
                  "20px 0",
              }}
            >
              Cargando usuarios...
            </div>

          )
        }


        {/* ================================================ */}
        {/* SIN VENTAS */}
        {/* ================================================ */}

        {
          !cargandoUsuarios &&
          gruposVentas.length === 0 && (

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


        {/* ================================================ */}
        {/* USUARIOS */}
        {/* ================================================ */}

        {
          !cargandoUsuarios &&

          gruposVentas.map(
            (grupo) => (

              <button
                key={
                  grupo.usuarioId ??
                  "sin_usuario"
                }

                onClick={() =>
                  setUsuarioSeleccionado(
                    grupo
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

                  transition:
                    "0.2s",
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

                    👤{" "}

                    {
                      grupo.nombre
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
                      grupo.ventas.length
                    }{" "}

                    {
                      grupo.ventas.length === 1
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
                      grupo.total
                    )
                  }

                </strong>

              </button>

            )
          )
        }


        {/* ================================================ */}
        {/* TOTAL FINAL */}
        {/* ================================================ */}

        {
          ventasVisibles.length > 0 && (

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
                    ventasVisibles.length
                  }{" "}

                  {
                    ventasVisibles.length === 1
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