"use client";

import { useState } from "react";

import { useAuth } from "../hooks/useAuth";
import { useMesas } from "../hooks/useMesas";
import { useInventario } from "../hooks/useInventario";
import { useVentas } from "../hooks/useVentas";

import { formatoCOP } from "../types/mesas";

import Login from "./components/auth/Login";

import MesasModule from "./components/mesas/MesasModule";

import InventarioModule from "./components/inventario/InventarioModule";

import UsuariosModule from "./components/usuarios/UsuariosModule";

import VentasModule from "./components/ventas/VentasModule";


// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function Home() {

  // ==========================================================
  // ESTADO DE LA SECCIÓN
  // ==========================================================

  const [
    seccion,
    setSeccion,
  ] = useState("Inicio");


  // ==========================================================
  // AUTENTICACIÓN
  // ==========================================================

  const {

    usuario,

    perfil,

    cargando:
      cargandoAuth,

    error:
      errorAuth,

    iniciarSesion,

    cerrarSesion,

    limpiarError,

  } = useAuth();


  // ==========================================================
  // MESAS
  // ==========================================================

  const mesasEstado =
    useMesas();


  const {

    mesas,

  } = mesasEstado;


  // ==========================================================
  // INVENTARIO
  // ==========================================================

  const inventarioEstado =
    useInventario();


  // ==========================================================
  // VENTAS
  //
  // IMPORTANTE:
  //
  // Estas ventas vienen del nuevo hook useVentas().
  //
  // Aquí se cargan:
  //
  // - Venta
  // - Mesa
  // - Usuario
  // - Productos
  // - Cantidad
  // - Precio
  // - Subtotal
  //
  // NO usamos mesasEstado.ventas para el módulo
  // de historial de ventas.
  // ==========================================================

  const ventasEstado =
    useVentas();


  const {

    ventas:
      ventasRegistradas,

    resumenUsuarios,

    cargando:
      cargandoVentas,

    error:
      errorVentas,

    totalVentasDia,

    cantidadVentasDia,

    cargarVentas,

    limpiarError:
      limpiarErrorVentas,

  } = ventasEstado;


  // ==========================================================
  // PANTALLA DE CARGA
  // ==========================================================

  if (cargandoAuth) {

    return (

      <main
        style={{

          minHeight:
            "100vh",

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          background:
            "#172131",

          fontFamily:
            "Arial, sans-serif",

        }}
      >

        <div
          style={{

            textAlign:
              "center",

            color:
              "white",

          }}
        >

          <div
            style={{

              fontSize:
                "55px",

              marginBottom:
                "15px",

            }}
          >
            🍺
          </div>


          <h2
            style={{

              margin:
                0,

            }}
          >
            YO PLAY BEER
          </h2>


          <p
            style={{

              color:
                "#b0bac8",

            }}
          >
            Cargando sistema...
          </p>

        </div>

      </main>

    );

  }


  // ==========================================================
  // LOGIN
  // ==========================================================

  if (
    !usuario ||
    !perfil
  ) {

    return (

      <Login

        onIniciarSesion={
          iniciarSesion
        }

        cargando={
          cargandoAuth
        }

        error={
          errorAuth
        }

        limpiarError={
          limpiarError
        }

      />

    );

  }


  // ==========================================================
  // ROL DEL USUARIO
  // ==========================================================

  const esAdministrador =
    perfil.rol ===
    "administrador";


  const esVendedor =
    perfil.rol ===
    "vendedor";


  // ==========================================================
  // MENÚ
  // ==========================================================

  const menu =
    esAdministrador

      ? [

          "Inicio",

          "Mesas",

          "Ventas",

          "Inventario",

          "Reportes",

          "Usuarios",

        ]

      : [

          "Inicio",

          "Mesas",

          "Ventas",

          "Inventario",

        ];


  // ==========================================================
  // ICONOS
  // ==========================================================

  const iconos:
    Record<string, string> =
  {

    Inicio:
      "🏠",

    Mesas:
      "🪑",

    Ventas:
      "💰",

    Inventario:
      "📦",

    Reportes:
      "📊",

    Usuarios:
      "👥",

  };


  // ==========================================================
  // CERRAR SESIÓN
  // ==========================================================

  async function manejarCerrarSesion() {

    mesasEstado.cerrarModal();


    await cerrarSesion();


    setSeccion(
      "Inicio"
    );

  }


  // ==========================================================
  // NOMBRE DEL USUARIO
  // ==========================================================

  const nombreUsuario =

    perfil.nombre ||

    usuario.email ||

    "Usuario";


  // ==========================================================
  // TEXTO DEL ROL
  // ==========================================================

  const textoRol =

    esAdministrador

      ? "Administrador"

      : "Vendedor";


  const iconoRol =

    esAdministrador

      ? "👑"

      : "💰";


  // ==========================================================
  // INTERFAZ
  // ==========================================================

  return (

    <main
      style={{

        minHeight:
          "100vh",

        background:
          "#f4f6f8",

        fontFamily:
          "Arial, sans-serif",

      }}
    >


      {/* ==================================================== */}
      {/* HEADER */}
      {/* ==================================================== */}

      <header
        style={{

          background:
            "#172131",

          color:
            "white",

          padding:
            "20px 30px",

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


        {/* LOGO */}

        <div>

          <h1
            style={{

              margin:
                0,

              fontSize:
                "26px",

            }}
          >
            🍺 YOPLAY BEER
          </h1>


          <p
            style={{

              margin:
                "5px 0 0",

              color:
                "#b0bac8",

            }}
          >
            Sistema de ventas e inventario
          </p>

        </div>


        {/* USUARIO */}

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


          <div
            style={{

              background:
                "#303d4f",

              padding:
                "10px 16px",

              borderRadius:
                "8px",

              display:
                "flex",

              flexDirection:
                "column",

              gap:
                "3px",

            }}
          >

            <strong
              style={{

                fontSize:
                  "14px",

              }}
            >
              👤 {nombreUsuario}
            </strong>


            <span
              style={{

                fontSize:
                  "12px",

                color:
                  "#cbd5e1",

              }}
            >
              {iconoRol} {textoRol}
            </span>

          </div>


          {/* SALIR */}

          <button

            onClick={
              manejarCerrarSesion
            }

            style={{

              background:
                "#dc2626",

              color:
                "white",

              border:
                "none",

              padding:
                "11px 14px",

              borderRadius:
                "8px",

              cursor:
                "pointer",

              fontWeight:
                700,

              fontSize:
                "13px",

            }}
          >
            🚪 Salir
          </button>

        </div>

      </header>


      {/* ==================================================== */}
      {/* CONTENEDOR */}
      {/* ==================================================== */}

      <div
        style={{

          display:
            "flex",

        }}
      >


        {/* ================================================== */}
        {/* MENÚ LATERAL */}
        {/* ================================================== */}

        <aside
          style={{

            width:
              "230px",

            minHeight:
              "calc(100vh - 92px)",

            background:
              "#263344",

            padding:
              "20px",

            boxSizing:
              "border-box",

          }}
        >


          {/* USUARIO */}

          <div
            style={{

              marginBottom:
                "25px",

              paddingBottom:
                "18px",

              borderBottom:
                "1px solid rgba(255,255,255,0.12)",

            }}
          >

            <div
              style={{

                color:
                  "white",

                fontWeight:
                  700,

                fontSize:
                  "15px",

                marginBottom:
                  "5px",

              }}
            >
              👤 {nombreUsuario}
            </div>


            <div
              style={{

                color:
                  "#b0bac8",

                fontSize:
                  "12px",

              }}
            >
              {iconoRol} {textoRol}
            </div>

          </div>


          {/* MENÚ */}

          {

            menu.map(

              (item) => (

                <button

                  key={item}

                  onClick={() => {

                    setSeccion(
                      item
                    );


                    // CERRAR MODAL DE MESAS
                    // AL CAMBIAR DE SECCIÓN

                    if (
                      item !== "Mesas"
                    ) {

                      mesasEstado.cerrarModal();

                    }

                  }}

                  style={{

                    width:
                      "100%",

                    padding:
                      "15px",

                    marginBottom:
                      "10px",

                    border:
                      "none",

                    borderRadius:
                      "8px",


                    background:

                      seccion === item

                        ? "#f59e0b"

                        : "transparent",


                    color:
                      "white",


                    textAlign:
                      "left",


                    cursor:
                      "pointer",


                    fontSize:
                      "16px",


                    fontWeight:

                      seccion === item

                        ? 700

                        : 400,

                  }}
                >

                  {iconos[item]} {item}

                </button>

              )

            )

          }

        </aside>


        {/* ================================================== */}
        {/* CONTENIDO */}
        {/* ================================================== */}

        <section
          style={{

            flex:
              1,

            padding:
              "30px",

            minWidth:
              0,

          }}
        >


          {/* ================================================ */}
          {/* INICIO */}
          {/* ================================================ */}

          {

            seccion === "Inicio" && (

              <>


                <h2>
                  🏠 Inicio
                </h2>


                <p
                  style={{

                    color:
                      "#6b7280",

                    marginTop:
                      "5px",

                  }}
                >

                  Bienvenido,{" "}

                  <strong>
                    {nombreUsuario}
                  </strong>.

                </p>


                {/* ========================================== */}
                {/* TARJETAS */}
                {/* ========================================== */}

                <div
                  style={{

                    display:
                      "grid",

                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(220px, 1fr))",

                    gap:
                      "20px",

                    marginTop:
                      "25px",

                  }}
                >


                  {/* VENTAS DEL DÍA */}

                  <Tarjeta

                    titulo={
                      "Ventas del día"
                    }

                    valor={
                      formatoCOP(
                        totalVentasDia
                      )
                    }

                    icono={
                      "💰"
                    }

                  />


                  {/* CANTIDAD DE VENTAS */}

                  <Tarjeta

                    titulo={
                      "Ventas realizadas"
                    }

                    valor={
                      cantidadVentasDia.toString()
                    }

                    icono={
                      "🧾"
                    }

                  />


                  {/* MESAS ACTIVAS */}

                  <Tarjeta

                    titulo={
                      "Mesas activas"
                    }

                    valor={

                      mesas

                        .filter(

                          (mesa) =>

                            mesa.estado ===
                            "Ocupada"

                        )

                        .length

                        .toString()

                    }

                    icono={
                      "🪑"
                    }

                  />


                  {/* PRODUCTOS */}

                  <Tarjeta

                    titulo={
                      "Productos"
                    }

                    valor={

                      inventarioEstado

                        .resumen

                        .totalProductos

                        .toString()

                    }

                    icono={
                      "🍺"
                    }

                  />


                  {/* INVENTARIO BAJO */}

                  <Tarjeta

                    titulo={
                      "Inventario bajo"
                    }

                    valor={

                      inventarioEstado

                        .resumen

                        .stockBajo

                        .toString()

                    }

                    icono={
                      "⚠️"
                    }

                  />

                </div>


                {/* ========================================== */}
                {/* BIENVENIDA */}
                {/* ========================================== */}

                <div
                  style={{

                    marginTop:
                      "30px",

                    background:
                      "white",

                    padding:
                      "25px",

                    borderRadius:
                      "12px",

                    boxShadow:
                      "0 2px 10px rgba(0,0,0,0.08)",

                  }}
                >

                  <h3>
                    Bienvenido a YO PLAY BEER 🍺
                  </h3>


                  <p
                    style={{

                      color:
                        "#6b7280",

                    }}
                  >

                    Desde este sistema podrás administrar
                    las ventas, mesas, inventario y reportes
                    del negocio.

                  </p>


                  <div
                    style={{

                      marginTop:
                        "18px",

                      padding:
                        "14px",

                      background:
                        "#f8fafc",

                      borderRadius:
                        "8px",

                      fontSize:
                        "14px",

                    }}
                  >

                    Sesión iniciada como{" "}

                    <strong>
                      {textoRol}
                    </strong>

                  </div>

                </div>

              </>

            )

          }


          {/* ================================================ */}
          {/* MESAS */}
          {/* ================================================ */}

          {

            seccion === "Mesas" && (

              <MesasModule

                estado={
                  mesasEstado
                }

              />

            )

          }


          {/* ================================================ */}
          {/* VENTAS */}
          {/* ================================================ */}

          {

            seccion === "Ventas" && (

              <VentasModule

                ventas={
                  ventasRegistradas
                }

                resumenUsuarios={
                  resumenUsuarios
                }

                cargando={
                  cargandoVentas
                }

                error={
                  errorVentas
                }

                cargarVentas={
                  cargarVentas
                }

                limpiarError={
                  limpiarErrorVentas
                }

                perfilActual={
                  perfil
                }

                esAdministrador={
                  esAdministrador
                }

              />

            )

          }


          {/* ================================================ */}
          {/* INVENTARIO */}
          {/* ================================================ */}

          {

            seccion === "Inventario" && (

              <InventarioModule

                estado={
                  inventarioEstado
                }

              />

            )

          }


          {/* ================================================ */}
          {/* REPORTES */}
          {/* ================================================ */}

          {

            seccion === "Reportes" &&

            esAdministrador && (

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

                <h2>
                  📊 Reportes
                </h2>


                <p
                  style={{

                    color:
                      "#6b7280",

                  }}
                >

                  Este módulo será desarrollado
                  próximamente.

                </p>

              </div>

            )

          }


          {/* ================================================ */}
          {/* USUARIOS */}
          {/* ================================================ */}

          {

            seccion === "Usuarios" &&

            esAdministrador && (

              <UsuariosModule

                perfilActual={
                  perfil
                }

              />

            )

          }

        </section>

      </div>

    </main>

  );

}


// ============================================================
// COMPONENTE TARJETA
// ============================================================

function Tarjeta({

  titulo,

  valor,

  icono,

}: {

  titulo:
    string;

  valor:
    string;

  icono:
    string;

}) {

  return (

    <div
      style={{

        background:
          "white",

        padding:
          "20px",

        borderRadius:
          "12px",

        boxShadow:
          "0 2px 10px rgba(0,0,0,0.08)",

      }}
    >

      <div
        style={{

          fontSize:
            "30px",

        }}
      >
        {icono}
      </div>


      <p
        style={{

          color:
            "#6b7280",

          marginBottom:
            "5px",

        }}
      >
        {titulo}
      </p>


      <h2
        style={{

          margin:
            0,

        }}
      >
        {valor}
      </h2>

    </div>

  );

}