"use client";

import { useMemo, useState } from "react";
import { UseMesasResult } from "../../../hooks/useMesas";
import { Mesa, formatoCOP } from "../../../types/mesas";
import MesasResumen from "./MesasResumen";
import MesasFiltros, { FiltroMesas } from "./MesasFiltros";
import MesaCard from "./MesaCard";
import MesaModal from "./MesaModal";
import ConfirmModal from "./ConfirmModal";
import Notificacion from "./Notificacion";

type Props = {
  estado: UseMesasResult;
};

export default function MesasModule({ estado }: Props) {
  const [filtro, setFiltro] = useState<FiltroMesas>("todas");
  const [busqueda, setBusqueda] = useState("");
  const [mesaAConfirmar, setMesaAConfirmar] = useState<Mesa | null>(null);

  const {
    mesas,
    cargandoMesas,
    errorMesas,
    mesaActual,
    resumen,
    notificacion,
    cerrarNotificacion,
    cargarMesas,
    abrirMesa,
    seleccionarMesa,
    cerrarModal,
    agregarProducto,
    aumentarCantidad,
    disminuirCantidad,
    eliminarProducto,
    cerrarMesa,
  } = estado;

  const mesasFiltradas = useMemo(() => {
    return mesas.filter((mesa) => {
      const coincideFiltro =
        filtro === "todas" ||
        (filtro === "libres" && mesa.estado === "Libre") ||
        (filtro === "ocupadas" && mesa.estado === "Ocupada");

      const coincideBusqueda =
        busqueda.trim() === "" || String(mesa.numero).includes(busqueda.trim());

      return coincideFiltro && coincideBusqueda;
    });
  }, [mesas, filtro, busqueda]);

  async function confirmarCierre() {
    if (!mesaAConfirmar) return;
    const exito = await cerrarMesa(mesaAConfirmar.id);
    if (exito) setMesaAConfirmar(null);
  }

  return (
    <div>
      {/* Estilos globales del módulo Mesas (hover, animaciones, foco visible). */}
      <style>{`
        .mesa-card {
          transition: transform 160ms ease, box-shadow 160ms ease;
        }
        .mesa-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.1);
        }
        .mesa-btn {
          transition: filter 120ms ease, transform 120ms ease;
        }
        .mesa-btn:hover:not(:disabled) {
          filter: brightness(1.07);
        }
        .mesa-btn:active:not(:disabled) {
          transform: scale(0.98);
        }
        .mesa-btn:focus-visible,
        .mesas-filtro-btn:focus-visible {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
        }
        .mesas-modal-entrada {
          animation: mesas-aparecer 160ms ease;
        }
        @keyframes mesas-aparecer {
          from {
            opacity: 0;
            transform: scale(0.97);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .mesas-skeleton {
          background: linear-gradient(90deg, #eceff3 25%, #f6f7f9 37%, #eceff3 63%);
          background-size: 400% 100%;
          animation: mesas-shimmer 1.4s ease infinite;
          border-radius: 16px;
          height: 168px;
        }
        @keyframes mesas-shimmer {
          0% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0 50%;
          }
        }
      `}</style>

      <div style={{ marginBottom: "18px" }}>
        <h2 style={{ margin: 0 }}>🪑 Mesas</h2>
        <p style={{ margin: "4px 0 0", color: "#6b7280" }}>Gestión y control de mesas</p>
      </div>

      <MesasResumen
        total={resumen.total}
        libres={resumen.libres}
        ocupadas={resumen.ocupadas}
        ventasActivas={resumen.ventasActivas}
      />

      <MesasFiltros
        filtro={filtro}
        onCambiarFiltro={setFiltro}
        busqueda={busqueda}
        onCambiarBusqueda={setBusqueda}
      />

      {errorMesas && (
        <div
          role="alert"
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            borderRadius: "10px",
            padding: "16px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span>{errorMesas}</span>
          <button
            onClick={cargarMesas}
            className="mesa-btn"
            style={{
              background: "#991b1b",
              color: "white",
              border: "none",
              padding: "8px 14px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            Reintentar
          </button>
        </div>
      )}

      {cargandoMesas ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
          }}
        >
          {Array.from({ length: 8 }).map((_, indice) => (
            <div key={indice} className="mesas-skeleton" aria-hidden="true" />
          ))}
        </div>
      ) : !errorMesas && mesas.length === 0 ? (
        <div
          style={{
            background: "white",
            borderRadius: "14px",
            padding: "40px",
            textAlign: "center",
            color: "#6b7280",
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          }}
        >
          No hay mesas registradas.
        </div>
      ) : (
        !errorMesas &&
        mesasFiltradas.length === 0 && (
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              padding: "30px",
              textAlign: "center",
              color: "#6b7280",
              boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            }}
          >
            Ninguna mesa coincide con el filtro o la búsqueda actual.
          </div>
        )
      )}

      {!cargandoMesas && !errorMesas && mesasFiltradas.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
          }}
        >
          {mesasFiltradas.map((mesa) => (
            <MesaCard
              key={mesa.id}
              mesa={mesa}
              onAbrir={abrirMesa}
              onGestionar={seleccionarMesa}
              onSolicitarCierre={setMesaAConfirmar}
            />
          ))}
        </div>
      )}

      {mesaActual && (
        <MesaModal
          mesa={mesaActual}
          onCerrarModal={cerrarModal}
          onAgregarProducto={agregarProducto}
          onAumentar={aumentarCantidad}
          onDisminuir={disminuirCantidad}
          onEliminar={eliminarProducto}
          onSolicitarCierre={setMesaAConfirmar}
        />
      )}

      {mesaAConfirmar && (
        <ConfirmModal
          titulo={`Cerrar cuenta — Mesa ${mesaAConfirmar.numero}`}
          mensaje={`Productos: ${mesaAConfirmar.productos.length}\nTotal: ${formatoCOP(
            mesaAConfirmar.total
          )}\n\n¿Deseas confirmar el pago y cerrar esta mesa?`}
          etiquetaConfirmar="Confirmar pago"
          peligroso
          onConfirmar={confirmarCierre}
          onCancelar={() => setMesaAConfirmar(null)}
        />
      )}

      {notificacion && <Notificacion notificacion={notificacion} onCerrar={cerrarNotificacion} />}
    </div>
  );
}



