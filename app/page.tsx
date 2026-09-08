"use client";

import { useState } from "react";

type Mesa = {
  id: number;
  estado: "Libre" | "Ocupada";
  total: number;
};

export default function Home() {
  const [seccion, setSeccion] = useState("Inicio");

  const [mesas, setMesas] = useState<Mesa[]>([
    { id: 1, estado: "Libre", total: 0 },
    { id: 2, estado: "Libre", total: 0 },
    { id: 3, estado: "Ocupada", total: 45000 },
    { id: 4, estado: "Libre", total: 0 },
    { id: 5, estado: "Ocupada", total: 78000 },
    { id: 6, estado: "Libre", total: 0 },
    { id: 7, estado: "Libre", total: 0 },
    { id: 8, estado: "Libre", total: 0 },
  ]);

  const abrirMesa = (id: number) => {
    setMesas(
      mesas.map((mesa) =>
        mesa.id === id
          ? { ...mesa, estado: "Ocupada" }
          : mesa
      )
    );
  };

  const cerrarMesa = (id: number) => {
    setMesas(
      mesas.map((mesa) =>
        mesa.id === id
          ? { ...mesa, estado: "Libre", total: 0 }
          : mesa
      )
    );
  };

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
      {/* ENCABEZADO */}

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

      <div
        style={{
          display: "flex",
        }}
      >
        {/* MENU */}

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
              onClick={() => setSeccion(item)}
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

        {/* CONTENIDO */}

        <section
          style={{
            flex: 1,
            padding: "30px",
          }}
        >
          {/* INICIO */}

          {seccion === "Inicio" && (
            <>
              <h2>🏠 Inicio</h2>

              <div
                style={{
                  display: "grid",

                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",

                  gap: "20px",

                  marginTop: "25px",
                }}
              >
                <Tarjeta
                  titulo="Ventas del día"
                  valor="$0"
                  icono="💰"
                />

                <Tarjeta
                  titulo="Mesas activas"
                  valor={
                    mesas
                      .filter(
                        (mesa) =>
                          mesa.estado === "Ocupada"
                      )
                      .length.toString()
                  }
                  icono="🪑"
                />

                <Tarjeta
                  titulo="Productos"
                  valor="0"
                  icono="🍺"
                />

                <Tarjeta
                  titulo="Inventario bajo"
                  valor="0"
                  icono="⚠️"
                />
              </div>

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
                <h3>Bienvenido a YO PLAY BEER 🍺</h3>

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

          {/* MESAS */}

          {seccion === "Mesas" && (
            <>
              <h2>🪑 Gestión de Mesas</h2>

              <p
                style={{
                  color: "#6b7280",
                }}
              >
                Selecciona una mesa para registrar
                productos o cerrar una cuenta.
              </p>

              <div
                style={{
                  display: "grid",

                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(180px, 1fr))",

                  gap: "20px",

                  marginTop: "30px",
                }}
              >
                {mesas.map((mesa) => (
                  <div
                    key={mesa.id}
                    style={{
                      background: "white",

                      padding: "20px",

                      borderRadius: "12px",

                      textAlign: "center",

                      boxShadow:
                        "0 2px 10px rgba(0,0,0,0.08)",

                      borderTop:
                        mesa.estado === "Libre"
                          ? "5px solid #22c55e"
                          : "5px solid #ef4444",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "40px",
                      }}
                    >
                      🪑
                    </div>

                    <h3>
                      Mesa {mesa.id}
                    </h3>

                    <p
                      style={{
                        fontWeight: "bold",

                        color:
                          mesa.estado === "Libre"
                            ? "#16a34a"
                            : "#dc2626",
                      }}
                    >
                      {mesa.estado}
                    </p>

                    {mesa.estado === "Ocupada" && (
                      <p>
                        Total:{" "}
                        <strong>
                          $
                          {mesa.total.toLocaleString(
                            "es-CO"
                          )}
                        </strong>
                      </p>
                    )}

                    {mesa.estado === "Libre" ? (
                      <button
                        onClick={() =>
                          abrirMesa(mesa.id)
                        }
                        style={{
                          width: "100%",

                          background: "#16a34a",

                          color: "white",

                          border: "none",

                          padding: "10px",

                          borderRadius: "6px",

                          cursor: "pointer",

                          fontWeight: "bold",
                        }}
                      >
                        Abrir mesa
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          cerrarMesa(mesa.id)
                        }
                        style={{
                          width: "100%",

                          background: "#ef4444",

                          color: "white",

                          border: "none",

                          padding: "10px",

                          borderRadius: "6px",

                          cursor: "pointer",

                          fontWeight: "bold",
                        }}
                      >
                        Cerrar cuenta
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* OTRAS SECCIONES */}

          {[
            "Ventas",
            "Inventario",
            "Reportes",
            "Usuarios",
          ].includes(seccion) && (
            <div
              style={{
                background: "white",

                padding: "30px",

                borderRadius: "12px",

                boxShadow:
                  "0 2px 10px rgba(0,0,0,0.08)",
              }}
            >
              <h2>
                {iconos[seccion]} {seccion}
              </h2>

              <p
                style={{
                  color: "#6b7280",
                }}
              >
                Este módulo será desarrollado
                próximamente.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}


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