"use client";

import { useState } from "react";

import { useMesas } from "../hooks/useMesas";
import { useInventario } from "../hooks/useInventario";

import { formatoCOP } from "../types/mesas";

import MesasModule from "./components/mesas/MesasModule";
import InventarioModule from "./components/inventario/InventarioModule";

export default function Home() {
  const [seccion, setSeccion] = useState("Inicio");

  // =========================================================
  // ESTADO DE MESAS Y VENTAS
  // =========================================================

  const mesasEstado = useMesas();

  const {
    mesas,
    ventas,
    ventasDelDia,
  } = mesasEstado;

  // =========================================================
  // ESTADO DE INVENTARIO
  // =========================================================

  const inventarioEstado = useInventario();

  // =========================================================
  // MENÚ PRINCIPAL
  // =========================================================

  const menu = [
    "Inicio",
    "Mesas",
    "Ventas",
    "Inventario",
    "Reportes",
    "Usuarios",
  ];

  const iconos: Record<string, string> = {
    Inicio: "🏠",
    Mesas: "🪑",
    Ventas: "💰",
    Inventario: "📦",
    Reportes: "📊",
    Usuarios: "👥",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f6f8",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* ===================================================== */}
      {/* ENCABEZADO */}
      {/* ===================================================== */}

      <header
        style={{
          background: "#172131",
          color: "white",
          padding: "20px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "26px",
            }}
          >
            🍺 YO PLAY BEER
          </h1>

          <p
            style={{
              margin: "5px 0 0",
              color: "#b0bac8",
            }}
          >
            Sistema de ventas e inventario
          </p>
        </div>

        <div
          style={{
            background: "#303d4f",
            padding: "12px 18px",
            borderRadius: "8px",
          }}
        >
          👤 Administrador
        </div>
      </header>

      {/* ===================================================== */}
      {/* CONTENEDOR PRINCIPAL */}
      {/* ===================================================== */}

      <div
        style={{
          display: "flex",
        }}
      >
        {/* =================================================== */}
        {/* MENÚ LATERAL */}
        {/* =================================================== */}

        <aside
          style={{
            width: "230px",
            minHeight: "calc(100vh - 92px)",
            background: "#263344",
            padding: "20px",
          }}
        >
          {menu.map((item) => (
            <button
              key={item}
              onClick={() => {
                setSeccion(item);

                // Cerrar modal de mesas
                // al cambiar de sección
                if (item !== "Mesas") {
                  mesasEstado.cerrarModal();
                }
              }}
              style={{
                width: "100%",
                padding: "15px",
                marginBottom: "10px",
                border: "none",
                borderRadius: "8px",

                background:
                  seccion === item
                    ? "#f59e0b"
                    : "transparent",

                color: "white",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              {iconos[item]} {item}
            </button>
          ))}
        </aside>

        {/* =================================================== */}
        {/* CONTENIDO PRINCIPAL */}
        {/* =================================================== */}

        <section
          style={{
            flex: 1,
            padding: "30px",
          }}
        >
          {/* ================================================= */}
          {/* INICIO */}
          {/* ================================================= */}

          {seccion === "Inicio" && (
            <>
              <h2>🏠 Inicio</h2>

              {/* TARJETAS DEL DASHBOARD */}

              <div
                style={{
                  display: "grid",

                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",

                  gap: "20px",

                  marginTop: "25px",
                }}
              >
                {/* VENTAS DEL DÍA */}

                <Tarjeta
                  titulo="Ventas del día"
                  valor={formatoCOP(ventasDelDia)}
                  icono="💰"
                />

                {/* MESAS ACTIVAS */}

                <Tarjeta
                  titulo="Mesas activas"
                  valor={
                    mesas
                      .filter(
                        (mesa) =>
                          mesa.estado === "Ocupada"
                      )
                      .length
                      .toString()
                  }
                  icono="🪑"
                />

                {/* PRODUCTOS */}

                <Tarjeta
                  titulo="Productos"
                  valor={
                    inventarioEstado.resumen.totalProductos
                      .toString()
                  }
                  icono="🍺"
                />

                {/* INVENTARIO BAJO */}

                <Tarjeta
                  titulo="Inventario bajo"
                  valor={
                    inventarioEstado.resumen.stockBajo
                      .toString()
                  }
                  icono="⚠️"
                />
              </div>

              {/* BIENVENIDA */}

              <div
                style={{
                  marginTop: "30px",
                  background: "white",
                  padding: "25px",
                  borderRadius: "12px",
                  boxShadow:
                    "0 2px 10px rgba(0,0,0,0.08)",
                }}
              >
                <h3>
                  Bienvenido a YO PLAY BEER 🍺
                </h3>

                <p
                  style={{
                    color: "#6b7280",
                  }}
                >
                  Desde este sistema podrás administrar
                  las ventas, mesas, inventario y reportes
                  del negocio.
                </p>
              </div>
            </>
          )}

          {/* ================================================= */}
          {/* MESAS */}
          {/* ================================================= */}

          {seccion === "Mesas" && (
            <MesasModule
              estado={mesasEstado}
            />
          )}

          {/* ================================================= */}
          {/* VENTAS */}
          {/* ================================================= */}

          {seccion === "Ventas" && (
            <div
              style={{
                background: "white",
                padding: "30px",
                borderRadius: "12px",
                boxShadow:
                  "0 2px 10px rgba(0,0,0,0.08)",
              }}
            >
              <h2>💰 Ventas</h2>

              {ventas.length === 0 ? (
                <p
                  style={{
                    color: "#6b7280",
                  }}
                >
                  Todavía no hay ventas registradas.
                </p>
              ) : (
                <div>
                  {ventas.map((venta) => (
                    <div
                      key={venta.id}
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        padding: "15px",
                        borderBottom:
                          "1px solid #e5e7eb",
                      }}
                    >
                      <span>
                        🪑 Mesa {venta.mesaNumero}
                      </span>

                      <strong>
                        {formatoCOP(venta.total)}
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================================================= */}
          {/* INVENTARIO */}
          {/* ================================================= */}

          {seccion === "Inventario" && (
            <InventarioModule
              estado={inventarioEstado}
            />
          )}

          {/* ================================================= */}
          {/* REPORTES */}
          {/* ================================================= */}

          {seccion === "Reportes" && (
            <div
              style={{
                background: "white",
                padding: "30px",
                borderRadius: "12px",
                boxShadow:
                  "0 2px 10px rgba(0,0,0,0.08)",
              }}
            >
              <h2>📊 Reportes</h2>

              <p
                style={{
                  color: "#6b7280",
                }}
              >
                Este módulo será desarrollado próximamente.
              </p>
            </div>
          )}

          {/* ================================================= */}
          {/* USUARIOS */}
          {/* ================================================= */}

          {seccion === "Usuarios" && (
            <div
              style={{
                background: "white",
                padding: "30px",
                borderRadius: "12px",
                boxShadow:
                  "0 2px 10px rgba(0,0,0,0.08)",
              }}
            >
              <h2>👥 Usuarios</h2>

              <p
                style={{
                  color: "#6b7280",
                }}
              >
                Este módulo será desarrollado próximamente.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}


/* ========================================================= */
/* COMPONENTE TARJETA */
/* ========================================================= */

function Tarjeta({
  titulo,
  valor,
  icono,
}: {
  titulo: string;
  valor: string;
  icono: string;
}) {
  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        boxShadow:
          "0 2px 10px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          fontSize: "30px",
        }}
      >
        {icono}
      </div>

      <p
        style={{
          color: "#6b7280",
          marginBottom: "5px",
        }}
      >
        {titulo}
      </p>

      <h2
        style={{
          margin: 0,
        }}
      >
        {valor}
      </h2>
    </div>
  );
}