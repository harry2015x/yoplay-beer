"use client";

import { useState } from "react";
import type { CSSProperties, FormEvent, ReactNode } from "react";

import type { PerfilUsuario, RolUsuario } from "../../../hooks/useAuth";
import type {
  EdicionUsuarioInput,
  NuevoUsuarioInput,
} from "../../../types/usuarios";

// ============================================================
// TIPOS
// ============================================================

type ModoModal = "crear" | "editar";

type Props = {
  modo: ModoModal;
  usuarioEditar: PerfilUsuario | null;
  guardando: boolean;
  perfilActualId: string;
  onCerrar: () => void;
  onCrear: (datos: NuevoUsuarioInput) => Promise<boolean>;
  onEditar: (datos: EdicionUsuarioInput) => Promise<boolean>;
};

type Errores = {
  nombre?: string;
  email?: string;
  password?: string;
  confirmarPassword?: string;
};

// ============================================================
// COMPONENTE
// ============================================================

export default function UsuarioModal({
  modo,
  usuarioEditar,
  guardando,
  perfilActualId,
  onCerrar,
  onCrear,
  onEditar,
}: Props) {
  const esEdicion = modo === "editar";
  const esUsuarioActual = usuarioEditar?.id === perfilActualId;

  const [nombre, setNombre] = useState(usuarioEditar?.nombre ?? "");
  const [email, setEmail] = useState(usuarioEditar?.email ?? "");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [rol, setRol] = useState<RolUsuario>(
    usuarioEditar?.rol ?? "vendedor"
  );
  const [activo, setActivo] = useState(usuarioEditar?.activo ?? true);
  const [errores, setErrores] = useState<Errores>({});

  // ============================================================
  // VALIDACIÓN DE FRONTEND
  // ============================================================

  function validar(): boolean {
    const nuevosErrores: Errores = {};

    if (nombre.trim().length < 2) {
      nuevosErrores.nombre =
        "El nombre debe tener al menos 2 caracteres.";
    }

    if (!esEdicion) {
      const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

      if (!emailValido) {
        nuevosErrores.email = "Ingresa un correo electrónico válido.";
      }

      if (password.length < 6) {
        nuevosErrores.password =
          "La contraseña debe tener al menos 6 caracteres.";
      }

      if (confirmarPassword !== password) {
        nuevosErrores.confirmarPassword = "Las contraseñas no coinciden.";
      }
    }

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  }

  async function manejarSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!validar()) {
      return;
    }

    if (esEdicion && usuarioEditar) {
      await onEditar({
        id: usuarioEditar.id,
        nombre: nombre.trim(),
        rol,
        activo,
      });

      return;
    }

    await onCrear({
      nombre: nombre.trim(),
      email: email.trim(),
      password,
      rol,
      activo,
    });
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      role="presentation"
      onClick={onCerrar}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "20px",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="usuario-modal-title"
        onClick={(evento) => evento.stopPropagation()}
        style={{
          background: "white",
          borderRadius: "18px",
          width: "100%",
          maxWidth: "480px",
          maxHeight: "88vh",
          overflowY: "auto",
          boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
        }}
      >
        {/* ENCABEZADO */}

        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <h2 id="usuario-modal-title" style={{ margin: 0 }}>
            {esEdicion ? "✏️ Editar usuario" : "👤 Nuevo usuario"}
          </h2>

          <button
            onClick={onCerrar}
            aria-label="Cerrar formulario de usuario"
            style={{
              background: "#f3f4f6",
              border: "none",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            ×
          </button>
        </div>

        {/* FORMULARIO */}

        <form
          onSubmit={manejarSubmit}
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <Campo etiqueta="Nombre completo" error={errores.nombre}>
            <input
              type="text"
              value={nombre}
              onChange={(evento) => setNombre(evento.target.value)}
              style={estiloInput}
            />
          </Campo>

          <Campo etiqueta="Correo electrónico" error={errores.email}>
            <input
              type="email"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              disabled={esEdicion}
              style={{
                ...estiloInput,
                background: esEdicion ? "#f3f4f6" : "white",
                color: esEdicion ? "#6b7280" : "inherit",
              }}
            />

            {esEdicion && (
              <span
                style={{
                  display: "block",
                  color: "#6b7280",
                  fontSize: "12px",
                  marginTop: "4px",
                }}
              >
                El correo no se puede modificar desde aquí.
              </span>
            )}
          </Campo>

          {!esEdicion && (
            <>
              <Campo etiqueta="Contraseña" error={errores.password}>
                <input
                  type="password"
                  value={password}
                  onChange={(evento) => setPassword(evento.target.value)}
                  style={estiloInput}
                />
              </Campo>

              <Campo
                etiqueta="Confirmar contraseña"
                error={errores.confirmarPassword}
              >
                <input
                  type="password"
                  value={confirmarPassword}
                  onChange={(evento) =>
                    setConfirmarPassword(evento.target.value)
                  }
                  style={estiloInput}
                />
              </Campo>
            </>
          )}

          <Campo etiqueta="Rol">
            <select
              value={rol}
              onChange={(evento) =>
                setRol(evento.target.value as RolUsuario)
              }
              disabled={esUsuarioActual}
              style={estiloInput}
            >
              <option value="administrador">Administrador</option>
              <option value="vendedor">Vendedor</option>
            </select>

            {esUsuarioActual && (
              <span
                style={{
                  display: "block",
                  color: "#6b7280",
                  fontSize: "12px",
                  marginTop: "4px",
                }}
              >
                No puedes cambiar tu propio rol.
              </span>
            )}
          </Campo>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "14px",
              color: "#374151",
            }}
          >
            <input
              type="checkbox"
              checked={activo}
              disabled={esUsuarioActual}
              onChange={(evento) => setActivo(evento.target.checked)}
            />
            Usuario activo
          </label>

          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <button
              type="button"
              onClick={onCerrar}
              disabled={guardando}
              style={{
                flex: 1,
                background: "#f3f4f6",
                color: "#374151",
                border: "none",
                padding: "12px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={guardando}
              style={{
                flex: 1,
                background: "#f59e0b",
                color: "white",
                border: "none",
                padding: "12px",
                borderRadius: "8px",
                cursor: guardando ? "not-allowed" : "pointer",
                fontWeight: 700,
                opacity: guardando ? 0.7 : 1,
              }}
            >
              {guardando
                ? esEdicion
                  ? "Guardando..."
                  : "Creando..."
                : esEdicion
                ? "Guardar cambios"
                : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// ESTILOS Y SUBCOMPONENTES
// ============================================================

const estiloInput: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  fontSize: "14px",
  boxSizing: "border-box",
};

function Campo({
  etiqueta,
  error,
  children,
}: {
  etiqueta: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "13px",
          fontWeight: 600,
          color: "#374151",
          marginBottom: "6px",
        }}
      >
        {etiqueta}
      </label>

      {children}

      {error && (
        <span
          style={{
            display: "block",
            color: "#dc2626",
            fontSize: "12px",
            marginTop: "4px",
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
