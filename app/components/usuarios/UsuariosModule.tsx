"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";

import { useUsuarios } from "../../../hooks/useUsuarios";
import type { PerfilUsuario, RolUsuario } from "../../../hooks/useAuth";
import {
  formatoFechaCO,
  type EdicionUsuarioInput,
  type FiltroEstadoUsuario,
  type FiltroRolUsuario,
  type NuevoUsuarioInput,
} from "../../../types/usuarios";

import UsuarioModal from "./UsuarioModal";

// ============================================================
// PROPS
// ============================================================

type Props = {
  perfilActual: PerfilUsuario;
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function UsuariosModule({ perfilActual }: Props) {
  const {
    usuarios,
    cargando,
    guardando,
    notificacion,
    resumen,
    crearUsuario,
    editarUsuario,
    cambiarEstadoUsuario,
    cerrarNotificacion,
  } = useUsuarios();

  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState<FiltroRolUsuario>("todos");
  const [filtroEstado, setFiltroEstado] =
    useState<FiltroEstadoUsuario>("todos");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEnEdicion, setUsuarioEnEdicion] =
    useState<PerfilUsuario | null>(null);

  const usuariosFiltrados = useMemo(() => {
    const busquedaNormalizada = busqueda.trim().toLowerCase();

    return usuarios.filter((usuarioItem) => {
      const coincideBusqueda =
        busquedaNormalizada.length === 0 ||
        usuarioItem.nombre.toLowerCase().includes(busquedaNormalizada) ||
        usuarioItem.email.toLowerCase().includes(busquedaNormalizada);

      const coincideRol =
        filtroRol === "todos" || usuarioItem.rol === filtroRol;

      const coincideEstado =
        filtroEstado === "todos" ||
        (filtroEstado === "activos" && usuarioItem.activo) ||
        (filtroEstado === "inactivos" && !usuarioItem.activo);

      return coincideBusqueda && coincideRol && coincideEstado;
    });
  }, [usuarios, busqueda, filtroRol, filtroEstado]);

  const esAdministrador = perfilActual.rol === "administrador";

  // ----------------------------------------------------------
  // ACCIONES
  // ----------------------------------------------------------

  function abrirModalCrear() {
    setUsuarioEnEdicion(null);
    setModalAbierto(true);
  }

  function abrirModalEditar(usuarioItem: PerfilUsuario) {
    setUsuarioEnEdicion(usuarioItem);
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setUsuarioEnEdicion(null);
  }

  async function manejarCrear(datos: NuevoUsuarioInput) {
    const exito = await crearUsuario(datos);

    if (exito) {
      cerrarModal();
    }

    return exito;
  }

  async function manejarEditar(datos: EdicionUsuarioInput) {
    const exito = await editarUsuario(datos);

    if (exito) {
      cerrarModal();
    }

    return exito;
  }

  async function manejarCambioEstado(usuarioItem: PerfilUsuario) {
    await cambiarEstadoUsuario(usuarioItem.id, !usuarioItem.activo);
  }

  // ----------------------------------------------------------
  // PROTECCIÓN INTERNA (segundo nivel de defensa, además de
  // la comprobación que ya existe en app/page.tsx)
  // ----------------------------------------------------------

  if (!esAdministrador) {
    return (
      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>👥 Usuarios</h2>

        <div
          style={{
            marginTop: "15px",
            padding: "15px",
            background: "#fee2e2",
            borderRadius: "8px",
            color: "#991b1b",
            fontSize: "14px",
          }}
        >
          No tienes permisos para administrar usuarios.
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------

  return (
    <div>
      {/* ENCABEZADO */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>👥 Usuarios</h2>

          <p style={{ color: "#6b7280", marginTop: "5px" }}>
            Administración de usuarios y permisos del sistema.
          </p>
        </div>

        <button
          onClick={abrirModalCrear}
          style={{
            background: "#f59e0b",
            color: "white",
            border: "none",
            padding: "12px 18px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "14px",
          }}
        >
          + Nuevo usuario
        </button>
      </div>

      {/* NOTIFICACIÓN */}

      {notificacion && (
        <div
          style={{
            marginBottom: "20px",
            padding: "14px 16px",
            borderRadius: "8px",
            background:
              notificacion.tipo === "success" ? "#dcfce7" : "#fee2e2",
            color:
              notificacion.tipo === "success" ? "#166534" : "#991b1b",
            fontSize: "14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span>{notificacion.mensaje}</span>

          <button
            onClick={cerrarNotificacion}
            aria-label="Cerrar notificación"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              color: "inherit",
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* TARJETAS DE RESUMEN */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "20px",
          marginBottom: "25px",
        }}
      >
        <TarjetaResumen
          titulo="Total usuarios"
          valor={resumen.total}
          icono="👥"
        />

        <TarjetaResumen
          titulo="Administradores"
          valor={resumen.administradores}
          icono="👑"
        />

        <TarjetaResumen
          titulo="Vendedores"
          valor={resumen.vendedores}
          icono="💰"
        />

        <TarjetaResumen
          titulo="Usuarios activos"
          valor={resumen.activos}
          icono="✅"
        />
      </div>

      {/* BUSCADOR Y FILTROS */}

      <div
        style={{
          background: "white",
          padding: "18px",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          marginBottom: "20px",
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          placeholder="Buscar por nombre o correo..."
          style={{
            flex: 1,
            minWidth: "200px",
            padding: "10px 12px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            fontSize: "14px",
            boxSizing: "border-box",
          }}
        />

        <select
          value={filtroRol}
          onChange={(evento) =>
            setFiltroRol(evento.target.value as FiltroRolUsuario)
          }
          style={{
            padding: "10px 12px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            fontSize: "14px",
          }}
        >
          <option value="todos">Todos los roles</option>
          <option value="administrador">Administradores</option>
          <option value="vendedor">Vendedores</option>
        </select>

        <select
          value={filtroEstado}
          onChange={(evento) =>
            setFiltroEstado(evento.target.value as FiltroEstadoUsuario)
          }
          style={{
            padding: "10px 12px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            fontSize: "14px",
          }}
        >
          <option value="todos">Todos los estados</option>
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
        </select>
      </div>

      {/* LISTADO */}

      <div
        style={{
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          overflowX: "auto",
        }}
      >
        {cargando ? (
          <div
            style={{
              padding: "30px",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            Cargando usuarios...
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div
            style={{
              padding: "30px",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            No se encontraron usuarios con los filtros seleccionados.
          </div>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "680px",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                <Encabezado texto="Nombre" />
                <Encabezado texto="Correo electrónico" />
                <Encabezado texto="Rol" />
                <Encabezado texto="Estado" />
                <Encabezado texto="Creado" />
                <Encabezado texto="Acciones" />
              </tr>
            </thead>

            <tbody>
              {usuariosFiltrados.map((usuarioItem) => {
                const esUsuarioActual =
                  usuarioItem.id === perfilActual.id;

                return (
                  <tr
                    key={usuarioItem.id}
                    style={{ borderBottom: "1px solid #e5e7eb" }}
                  >
                    <Celda>
                      <strong>{usuarioItem.nombre}</strong>

                      {esUsuarioActual && (
                        <span
                          style={{
                            color: "#6b7280",
                            fontSize: "12px",
                          }}
                        >
                          {" "}
                          (tú)
                        </span>
                      )}
                    </Celda>

                    <Celda>{usuarioItem.email}</Celda>

                    <Celda>
                      <BadgeRol rol={usuarioItem.rol} />
                    </Celda>

                    <Celda>
                      <BadgeEstado activo={usuarioItem.activo} />
                    </Celda>

                    <Celda>{formatoFechaCO(usuarioItem.created_at)}</Celda>

                    <Celda>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          onClick={() => abrirModalEditar(usuarioItem)}
                          style={{
                            background: "#eff6ff",
                            color: "#1e40af",
                            border: "none",
                            padding: "7px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: "13px",
                          }}
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => manejarCambioEstado(usuarioItem)}
                          disabled={esUsuarioActual || guardando}
                          style={{
                            background: usuarioItem.activo
                              ? "#fee2e2"
                              : "#dcfce7",
                            color: usuarioItem.activo
                              ? "#991b1b"
                              : "#166534",
                            border: "none",
                            padding: "7px 12px",
                            borderRadius: "6px",
                            cursor: esUsuarioActual
                              ? "not-allowed"
                              : "pointer",
                            fontWeight: 600,
                            fontSize: "13px",
                            opacity: esUsuarioActual ? 0.5 : 1,
                          }}
                        >
                          {usuarioItem.activo ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </Celda>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL DE CREACIÓN / EDICIÓN */}

      {modalAbierto && (
        <UsuarioModal
          modo={usuarioEnEdicion ? "editar" : "crear"}
          usuarioEditar={usuarioEnEdicion}
          guardando={guardando}
          perfilActualId={perfilActual.id}
          onCerrar={cerrarModal}
          onCrear={manejarCrear}
          onEditar={manejarEditar}
        />
      )}
    </div>
  );
}

// ============================================================
// SUBCOMPONENTES DE PRESENTACIÓN
// ============================================================

function TarjetaResumen({
  titulo,
  valor,
  icono,
}: {
  titulo: string;
  valor: number;
  icono: string;
}) {
  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ fontSize: "30px" }}>{icono}</div>

      <p style={{ color: "#6b7280", marginBottom: "5px" }}>{titulo}</p>

      <h2 style={{ margin: 0 }}>{valor}</h2>
    </div>
  );
}

function Encabezado({ texto }: { texto: string }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "14px 16px",
        color: "#6b7280",
        fontSize: "12px",
        textTransform: "uppercase",
        letterSpacing: "0.03em",
      }}
    >
      {texto}
    </th>
  );
}

function Celda({ children }: { children: ReactNode }) {
  return (
    <td
      style={{
        padding: "14px 16px",
        fontSize: "14px",
        verticalAlign: "middle",
      }}
    >
      {children}
    </td>
  );
}

function BadgeRol({ rol }: { rol: RolUsuario }) {
  const esAdministrador = rol === "administrador";

  return (
    <span
      style={{
        fontSize: "12px",
        fontWeight: 700,
        padding: "4px 10px",
        borderRadius: "999px",
        background: esAdministrador ? "#fef3c7" : "#eff6ff",
        color: esAdministrador ? "#92400e" : "#1e40af",
      }}
    >
      {esAdministrador ? "👑 Administrador" : "💰 Vendedor"}
    </span>
  );
}

function BadgeEstado({ activo }: { activo: boolean }) {
  return (
    <span
      style={{
        fontSize: "12px",
        fontWeight: 700,
        padding: "4px 10px",
        borderRadius: "999px",
        background: activo ? "#dcfce7" : "#fee2e2",
        color: activo ? "#166534" : "#991b1b",
      }}
    >
      {activo ? "ACTIVO" : "INACTIVO"}
    </span>
  );
}
