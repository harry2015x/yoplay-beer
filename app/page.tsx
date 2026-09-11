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

const LOGO_IMAGE_URL =
  "https://res.cloudinary.com/dv1gz4eqo/image/upload/v1789083650/LOGO-11_oeaddu.png";

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function Home() {
  // ==========================================================
  // ESTADO DE LA SECCIÓN
  // ==========================================================

  const [seccion, setSeccion] = useState("Inicio");

  // ==========================================================
  // AUTENTICACIÓN
  // ==========================================================

  const {
    usuario,
    perfil,
    cargando: cargandoAuth,
    error: errorAuth,
    iniciarSesion,
    cerrarSesion,
    limpiarError,
  } = useAuth();

  // ==========================================================
  // MESAS
  // ==========================================================

  const mesasEstado = useMesas();
  const { mesas } = mesasEstado;

  // ==========================================================
  // INVENTARIO
  // ==========================================================

  const inventarioEstado = useInventario();

  // ==========================================================
  // VENTAS
  //
  // IMPORTANTE:
  //
  // Estas ventas vienen del nuevo hook useVentas().
  //
  // Aquí se cargan:
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

  const ventasEstado = useVentas();

  const {
    ventas: ventasRegistradas,
    resumenUsuarios,
    cargando: cargandoVentas,
    error: errorVentas,
    totalVentasDia,
    cantidadVentasDia,
    cargarVentas,
    limpiarError: limpiarErrorVentas,
  } = ventasEstado;

  // ==========================================================
  // PANTALLA DE CARGA
  // ==========================================================

  if (cargandoAuth) {
    return (
      <main className="pantalla-carga">
        <div className="pantalla-carga__logo-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_IMAGE_URL} alt="YOPlay Beer" className="pantalla-carga__logo" />
        </div>
        <h2 className="pantalla-carga__titulo">YOPlay Beer</h2>
        <p className="pantalla-carga__subtitulo">Cargando sistema...</p>

        <style jsx>{`
          .pantalla-carga {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 6px;
            background: radial-gradient(circle at 50% 30%, #14231c 0%, #0b0f0d 70%);
            font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            color: #fff;
          }
          .pantalla-carga__logo-wrap {
            position: relative;
            margin-bottom: 8px;
          }
          .pantalla-carga__logo-wrap::before {
            content: "";
            position: absolute;
            inset: -40%;
            background: radial-gradient(circle, rgba(57, 255, 20, 0.35), transparent 70%);
            filter: blur(20px);
            animation: respirar 2.2s ease-in-out infinite;
          }
          .pantalla-carga__logo {
            position: relative;
            height: 64px;
            width: auto;
            object-fit: contain;
            filter: drop-shadow(0 0 10px rgba(57, 255, 20, 0.45));
          }
          .pantalla-carga__titulo {
            position: relative;
            margin: 0;
            font-size: 20px;
            font-weight: 700;
            letter-spacing: 0.01em;
          }
          .pantalla-carga__subtitulo {
            position: relative;
            margin: 0;
            color: rgba(255, 255, 255, 0.5);
            font-size: 14px;
          }
          @keyframes respirar {
            0%,
            100% {
              opacity: 0.4;
              transform: scale(0.95);
            }
            50% {
              opacity: 0.85;
              transform: scale(1.05);
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .pantalla-carga__logo-wrap::before {
              animation: none;
            }
          }
        `}</style>
      </main>
    );
  }

  // ==========================================================
  // LOGIN
  // ==========================================================

  if (!usuario || !perfil) {
    return (
      <Login
        onIniciarSesion={iniciarSesion}
        cargando={cargandoAuth}
        error={errorAuth}
        limpiarError={limpiarError}
      />
    );
  }

  // ==========================================================
  // ROL DEL USUARIO
  // ==========================================================

  const esAdministrador = perfil.rol === "administrador";
  const esVendedor = perfil.rol === "vendedor";

  // ==========================================================
  // MENÚ
  // ==========================================================

  const menu = esAdministrador
    ? ["Inicio", "Mesas", "Ventas", "Inventario", "Reportes", "Usuarios"]
    : ["Inicio", "Mesas", "Ventas", "Inventario"];

  // ==========================================================
  // ICONOS
  // ==========================================================

  const iconos: Record<string, string> = {
    Inicio: "🏠",
    Mesas: "🪑",
    Ventas: "💰",
    Inventario: "📦",
    Reportes: "📊",
    Usuarios: "👥",
  };

  // ==========================================================
  // CERRAR SESIÓN
  // ==========================================================

  async function manejarCerrarSesion() {
    mesasEstado.cerrarModal();
    await cerrarSesion();
    setSeccion("Inicio");
  }

  // ==========================================================
  // NOMBRE DEL USUARIO
  // ==========================================================

  const nombreUsuario = perfil.nombre || usuario.email || "Usuario";
  const inicialUsuario = nombreUsuario.trim().charAt(0).toUpperCase() || "U";

  // ==========================================================
  // TEXTO DEL ROL
  // ==========================================================

  const textoRol = esAdministrador ? "Administrador" : "Vendedor";
  const iconoRol = esAdministrador ? "👑" : "💰";

  // ==========================================================
  // INTERFAZ
  // ==========================================================

  return (
    <main className="app">
      {/* ==================================================== */}
      {/* HEADER */}
      {/* ==================================================== */}

      <header className="app__header">
        <div className="marca">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_IMAGE_URL} alt="YOPlay Beer" className="marca__logo" />
          <div>
            <h1 className="marca__titulo">YOPlay Beer</h1>
            <p className="marca__subtitulo">Sistema de ventas e inventario</p>
          </div>
        </div>

        <div className="sesion">
          <div className="sesion__usuario">
            <span className="avatar" aria-hidden="true">
              {inicialUsuario}
            </span>
            <div className="sesion__datos">
              <strong>{nombreUsuario}</strong>
              <span>
                {iconoRol} {textoRol}
              </span>
            </div>
          </div>

          <button onClick={manejarCerrarSesion} className="boton-salir">
            🚪 Salir
          </button>
        </div>
      </header>

      <div className="app__cuerpo">
        {/* ================================================== */}
        {/* MENÚ LATERAL */}
        {/* ================================================== */}

        <aside className="menu">
          <div className="menu__usuario">
            <div className="menu__usuario-nombre">
              👤 {nombreUsuario}
            </div>
            <div className="menu__usuario-rol">
              {iconoRol} {textoRol}
            </div>
          </div>

          {menu.map((item) => (
            <button
              key={item}
              onClick={() => {
                setSeccion(item);

                // CERRAR MODAL DE MESAS AL CAMBIAR DE SECCIÓN
                if (item !== "Mesas") {
                  mesasEstado.cerrarModal();
                }
              }}
              className={`menu__item ${seccion === item ? "menu__item--activo" : ""}`}
            >
              {iconos[item]} {item}
            </button>
          ))}
        </aside>

        {/* ================================================== */}
        {/* CONTENIDO */}
        {/* ================================================== */}

        <section className="contenido">
          {/* ================================================ */}
          {/* INICIO */}
          {/* ================================================ */}

          {seccion === "Inicio" && (
            <>
              <h2 className="contenido__titulo">🏠 Inicio</h2>
              <p className="contenido__saludo">
                Bienvenido, <strong>{nombreUsuario}</strong>.
              </p>

              <div className="tarjetas">
                <Tarjeta
                  titulo="Ventas del día"
                  valor={formatoCOP(totalVentasDia)}
                  icono="💰"
                  acento="#39ff14"
                />

                <Tarjeta
                  titulo="Ventas realizadas"
                  valor={cantidadVentasDia.toString()}
                  icono="🧾"
                  acento="#16c784"
                />

                <Tarjeta
                  titulo="Mesas activas"
                  valor={mesas.filter((mesa) => mesa.estado === "Ocupada").length.toString()}
                  icono="🪑"
                  acento="#f59e0b"
                />

                <Tarjeta
                  titulo="Productos"
                  valor={inventarioEstado.resumen.totalProductos.toString()}
                  icono="🍺"
                  acento="#38bdf8"
                />

                <Tarjeta
                  titulo="Inventario bajo"
                  valor={inventarioEstado.resumen.stockBajo.toString()}
                  icono="⚠️"
                  acento="#ef4444"
                />
              </div>

              <div className="bienvenida">
                <h3>Bienvenido a YOPlay Beer 🍺</h3>
                <p>
                  Desde este sistema podrás administrar las ventas, mesas, inventario y
                  reportes del negocio.
                </p>
                <div className="bienvenida__nota">
                  Sesión iniciada como <strong>{textoRol}</strong>
                </div>
              </div>
            </>
          )}

          {/* ================================================ */}
          {/* MESAS */}
          {/* ================================================ */}

          {seccion === "Mesas" && <MesasModule estado={mesasEstado} />}

          {/* ================================================ */}
          {/* VENTAS */}
          {/* ================================================ */}

          {seccion === "Ventas" && (
            <VentasModule
              ventas={ventasRegistradas}
              resumenUsuarios={resumenUsuarios}
              cargando={cargandoVentas}
              error={errorVentas}
              cargarVentas={cargarVentas}
              limpiarError={limpiarErrorVentas}
              perfilActual={perfil}
              esAdministrador={esAdministrador}
            />
          )}

          {/* ================================================ */}
          {/* INVENTARIO */}
          {/* ================================================ */}

          {seccion === "Inventario" && <InventarioModule estado={inventarioEstado} />}

          {/* ================================================ */}
          {/* REPORTES */}
          {/* ================================================ */}

          {seccion === "Reportes" && esAdministrador && (
            <div className="panel">
              <h2>📊 Reportes</h2>
              <p>Este módulo será desarrollado próximamente.</p>
            </div>
          )}

          {/* ================================================ */}
          {/* USUARIOS */}
          {/* ================================================ */}

          {seccion === "Usuarios" && esAdministrador && (
            <UsuariosModule perfilActual={perfil} />
          )}
        </section>
      </div>

      <style jsx>{`
        .app {
          min-height: 100vh;
          background: #f5f7f6;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #0f172a;
        }

        .app__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          padding: 18px 30px;
          background: linear-gradient(135deg, #0b1310, #111d17);
          color: #fff;
          border-bottom: 1px solid rgba(57, 255, 20, 0.15);
        }

        .marca {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .marca__logo {
          height: 42px;
          width: auto;
          object-fit: contain;
          filter: drop-shadow(0 0 6px rgba(57, 255, 20, 0.35));
        }

        .marca__titulo {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        .marca__subtitulo {
          margin: 4px 0 0;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.55);
        }

        .sesion {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sesion__usuario {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 8px 14px 8px 8px;
          border-radius: 999px;
        }

        .avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #39ff14, #16c784);
          color: #062012;
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
        }

        .sesion__datos {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 13px;
          line-height: 1.3;
        }

        .sesion__datos span {
          color: rgba(255, 255, 255, 0.55);
          font-size: 12px;
        }

        .boton-salir {
          background: #dc2626;
          color: #fff;
          border: none;
          padding: 11px 16px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          transition: filter 0.2s ease, transform 0.2s ease;
        }
        .boton-salir:hover {
          filter: brightness(1.08);
          transform: translateY(-1px);
        }
        .boton-salir:active {
          transform: translateY(0);
        }

        .app__cuerpo {
          display: flex;
        }

        .menu {
          width: 230px;
          flex-shrink: 0;
          min-height: calc(100vh - 87px);
          background: #0d1512;
          padding: 20px;
          box-sizing: border-box;
        }

        .menu__usuario {
          margin-bottom: 22px;
          padding-bottom: 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .menu__usuario-nombre {
          color: #fff;
          font-weight: 700;
          font-size: 15px;
          margin-bottom: 5px;
        }
        .menu__usuario-rol {
          color: rgba(255, 255, 255, 0.5);
          font-size: 12px;
        }

        .menu__item {
          display: block;
          width: 100%;
          text-align: left;
          padding: 13px 14px;
          margin-bottom: 8px;
          border: none;
          border-left: 3px solid transparent;
          border-radius: 8px;
          background: transparent;
          color: rgba(255, 255, 255, 0.72);
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }
        .menu__item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
        }
        .menu__item--activo {
          background: rgba(57, 255, 20, 0.12);
          border-left-color: #39ff14;
          color: #fff;
          font-weight: 700;
        }

        .contenido {
          flex: 1;
          min-width: 0;
          padding: 30px;
        }

        .contenido__titulo {
          margin: 0;
        }

        .contenido__saludo {
          color: #64748b;
          margin-top: 5px;
        }

        .tarjetas {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-top: 25px;
        }

        .bienvenida,
        .panel {
          margin-top: 30px;
          background: #fff;
          padding: 25px;
          border-radius: 14px;
          box-shadow: 0 2px 14px rgba(15, 23, 42, 0.06);
        }
        .panel {
          margin-top: 0;
        }
        .bienvenida h3,
        .panel h2 {
          margin-top: 0;
        }
        .bienvenida p,
        .panel p {
          color: #64748b;
        }

        .bienvenida__nota {
          margin-top: 18px;
          padding: 14px;
          background: #f8fafc;
          border-radius: 8px;
          font-size: 14px;
        }

        @media (max-width: 720px) {
          .app__cuerpo {
            flex-direction: column;
          }
          .menu {
            width: 100%;
            min-height: auto;
            display: flex;
            gap: 8px;
            overflow-x: auto;
          }
          .menu__usuario {
            display: none;
          }
          .menu__item {
            width: auto;
            white-space: nowrap;
            margin-bottom: 0;
            border-left: none;
            border-bottom: 3px solid transparent;
          }
          .menu__item--activo {
            border-bottom-color: #39ff14;
          }
        }
      `}</style>
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
  acento = "#39ff14",
}: {
  titulo: string;
  valor: string;
  icono: string;
  acento?: string;
}) {
  return (
    <div className="tarjeta">
      <div className="tarjeta__icono" style={{ background: `${acento}1a`, color: acento }}>
        {icono}
      </div>
      <p className="tarjeta__titulo">{titulo}</p>
      <h2 className="tarjeta__valor">{valor}</h2>

      <style jsx>{`
        .tarjeta {
          background: #fff;
          padding: 20px;
          border-radius: 14px;
          box-shadow: 0 2px 14px rgba(15, 23, 42, 0.06);
          transition: box-shadow 0.2s ease, transform 0.2s ease;
        }
        .tarjeta:hover {
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.1);
          transform: translateY(-2px);
        }
        .tarjeta__icono {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          font-size: 20px;
          margin-bottom: 12px;
        }
        .tarjeta__titulo {
          color: #6b7280;
          margin: 0 0 4px;
          font-size: 13.5px;
        }
        .tarjeta__valor {
          margin: 0;
          font-size: 22px;
        }
      `}</style>
    </div>
  );
}
