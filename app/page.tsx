"use client";

import { useState } from "react";

export default function Home() {
  const [seccion, setSeccion] = useState("Inicio");

  return (
    <main style={{ minHeight: "100vh", background: "#f4f6f8" }}>
      
      {/* ENCABEZADO */}
      <header
        style={{
          background: "#111827",
          color: "white",
          padding: "20px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "26px" }}>
            🍺 YO PLAY BEER
          </h1>

          <p style={{ margin: "5px 0 0", color: "#9ca3af" }}>
            Sistema de ventas e inventario
          </p>
        </div>

        <div
          style={{
            background: "#374151",
            padding: "10px 15px",
            borderRadius: "8px",
          }}
        >
          Administrador
        </div>
      </header>

      <div style={{ display: "flex" }}>
        
        {/* MENU */}
        <aside
          style={{
            width: "230px",
            minHeight: "calc(100vh - 92px)",
            background: "#1f2937",
            padding: "20px",
          }}
        >
          {[
            "🏠 Inicio",
            "🪑 Mesas",
            "💰 Ventas",
            "📦 Inventario",
            "📊 Reportes",
            "👥 Usuarios",
          ].map((item) => (
            <button
              key={item}
              onClick={() => setSeccion(item)}
              style={{
                width: "100%",
                padding: "14px",
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
                fontSize: "15px",
              }}
            >
              {item}
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
          <h2 style={{ color: "#111827" }}>
            {seccion}
          </h2>

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
              valor="0"
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

            <p style={{ color: "#6b7280" }}>
              Desde este sistema podrás administrar las
              ventas, mesas, inventario y reportes del negocio.
            </p>
          </div>
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
      <div style={{ fontSize: "30px" }}>
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
          color: "#111827",
        }}
      >
        {valor}
      </h2>
    </div>
  );
}