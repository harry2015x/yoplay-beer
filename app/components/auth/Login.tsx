"use client";

import { FormEvent, useState } from "react";

type Props = {
  onIniciarSesion: (
    email: string,
    password: string
  ) => Promise<boolean>;

  cargando: boolean;
  error: string | null;
  limpiarError: () => void;
};

export default function Login({
  onIniciarSesion,
  cargando,
  error,
  limpiarError,
}: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function manejarSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    limpiarError();

    await onIniciarSesion(
      email.trim(),
      password
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "white",
          borderRadius: "20px",
          padding: "36px",
          boxShadow:
            "0 25px 60px rgba(0, 0, 0, 0.35)",
        }}
      >
        {/* LOGO */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              fontSize: "55px",
              marginBottom: "10px",
            }}
          >
            🍺
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              color: "#0f172a",
            }}
          >
            YOPlay Beer
          </h1>

          <p
            style={{
              margin: "8px 0 0",
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Sistema de gestión y ventas
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div
            role="alert"
            style={{
              background: "#fef2f2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
              borderRadius: "10px",
              padding: "12px",
              marginBottom: "18px",
              fontSize: "14px",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* FORMULARIO */}
        <form onSubmit={manejarSubmit}>
          {/* EMAIL */}
          <div
            style={{
              marginBottom: "18px",
            }}
          >
            <label
              htmlFor="email"
              style={{
                display: "block",
                marginBottom: "7px",
                fontWeight: 700,
                fontSize: "14px",
                color: "#334155",
              }}
            >
              Correo electrónico
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(evento) => {
                setEmail(evento.target.value);
                limpiarError();
              }}
              placeholder="correo@ejemplo.com"
              required
              autoComplete="email"
              disabled={cargando}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "13px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                fontSize: "15px",
                outline: "none",
              }}
            />
          </div>

          {/* PASSWORD */}
          <div
            style={{
              marginBottom: "24px",
            }}
          >
            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: "7px",
                fontWeight: 700,
                fontSize: "14px",
                color: "#334155",
              }}
            >
              Contraseña
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(evento) => {
                setPassword(evento.target.value);
                limpiarError();
              }}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              disabled={cargando}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "13px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                fontSize: "15px",
                outline: "none",
              }}
            />
          </div>

          {/* BOTÓN */}
          <button
            type="submit"
            disabled={cargando}
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "10px",
              background: cargando
                ? "#94a3b8"
                : "#16a34a",
              color: "white",
              fontSize: "15px",
              fontWeight: 700,
              cursor: cargando
                ? "not-allowed"
                : "pointer",
            }}
          >
            {cargando
              ? "Ingresando..."
              : "🔐 Ingresar"}
          </button>
        </form>

        <div
          style={{
            marginTop: "25px",
            paddingTop: "18px",
            borderTop: "1px solid #e2e8f0",
            textAlign: "center",
            color: "#94a3b8",
            fontSize: "12px",
          }}
        >
          YOPlay Beer © 2026
        </div>
      </div>
    </main>
  );
}