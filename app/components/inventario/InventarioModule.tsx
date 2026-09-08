// ARCHIVO: app/components/inventario/InventarioModule.tsx
"use client";

import { useMemo, useState } from "react";
import type {
  FiltroStock,
  ProductoInventario,
  TipoMovimiento,
  UseInventarioResult,
} from "../../../types/inventario";
import { calcularEstadoStock } from "../../../types/inventario";
import InventarioResumen from "./InventarioResumen";
import InventarioFiltros from "./InventarioFiltros";
import ProductoCard from "./ProductoCard";
import ProductoModal from "./ProductoModal";
import MovimientoModal, { type MovimientoContexto } from "./MovimientoModal";
import ConfirmModalInventario from "./ConfirmModalInventario";
import HistorialMovimientos from "./HistorialMovimientos";
import NotificacionInventario from "./NotificacionInventario";
import styles from "./inventario.module.css";

type Props = {
  estado: UseInventarioResult;
};

export default function InventarioModule({ estado }: Props) {
  const {
    productos,
    movimientos,
    cargandoProductos,
    cargandoMovimientos,
    errorProductos,
    errorMovimientos,
    notificacion,
    resumen,
    cargarProductos,
    agregarProducto,
    editarProducto,
    eliminarProducto,
    registrarEntrada,
    registrarSalida,
    registrarAjuste,
    cerrarNotificacion,
  } = estado;

  const [busqueda, setBusqueda] = useState("");
  const [filtroStock, setFiltroStock] = useState<FiltroStock>("todos");

  // Estados de modales — cada uno se renderiza solo cuando su valor
  // no es null/false, para evitar overlays fantasma.
  const [modalProductoAbierto, setModalProductoAbierto] = useState(false);
  const [productoEnEdicion, setProductoEnEdicion] =
    useState<ProductoInventario | null>(null);
  const [productoAEliminar, setProductoAEliminar] =
    useState<ProductoInventario | null>(null);
  const [movimientoActual, setMovimientoActual] =
    useState<MovimientoContexto | null>(null);

  const productosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return productos.filter((producto) => {
      const coincideBusqueda =
        termino === "" ||
        producto.nombre.toLowerCase().includes(termino) ||
        (producto.categoria ?? "").toLowerCase().includes(termino);

      if (!coincideBusqueda) return false;

      if (filtroStock === "inactivos") {
        return !producto.activo;
      }

      const estadoStock = calcularEstadoStock(producto);
      if (filtroStock === "normal") return estadoStock === "normal";
      if (filtroStock === "bajo") return estadoStock === "bajo";
      if (filtroStock === "sin_stock") return estadoStock === "sin_stock";
      return true; // "todos"
    });
  }, [productos, busqueda, filtroStock]);

  function abrirModalNuevoProducto() {
    setProductoEnEdicion(null);
    setModalProductoAbierto(true);
  }

  function abrirModalEditarProducto(producto: ProductoInventario) {
    setProductoEnEdicion(producto);
    setModalProductoAbierto(true);
  }

  function cerrarModalProducto() {
    setModalProductoAbierto(false);
    setProductoEnEdicion(null);
  }

  function abrirMovimiento(producto: ProductoInventario, tipo: TipoMovimiento) {
    setMovimientoActual({ producto, tipo });
  }

  return (
    <div style={{ width: "100%", maxWidth: 1200, margin: "0 auto" }}>
      {/* Encabezado */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#111827",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            📦 Inventario
          </h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0 0" }}>
            Control de productos y existencias
          </p>
        </div>

        <button
          type="button"
          onClick={abrirModalNuevoProducto}
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            border: "none",
            background: "#f59e0b",
            color: "white",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            transition: "filter 120ms ease, transform 120ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = "brightness(1.07)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = "brightness(1)";
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "scale(0.98)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          + Nuevo producto
        </button>
      </div>

      {/* Resumen */}
      <InventarioResumen resumen={resumen} />

      {/* Filtros */}
      <InventarioFiltros
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        filtro={filtroStock}
        onFiltroChange={setFiltroStock}
      />

      {/* Estado de error al cargar productos */}
      {errorProductos && !cargandoProductos && (
        <div
          style={{
            background: "#fef2f2",
            borderRadius: 14,
            padding: 20,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <span style={{ color: "#ef4444", fontSize: 14, fontWeight: 600 }}>
            {errorProductos}
          </span>
          <button
            type="button"
            onClick={cargarProductos}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              background: "#ef4444",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Skeleton de carga */}
      {cargandoProductos && !errorProductos && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={styles.skeleton}
              style={{ height: 88, borderRadius: 14 }}
            />
          ))}
        </div>
      )}

      {/* Estado vacío */}
      {!cargandoProductos && !errorProductos && productos.length === 0 && (
        <div
          style={{
            background: "white",
            borderRadius: 14,
            padding: 48,
            textAlign: "center",
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
          <p
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#111827",
              margin: "0 0 6px 0",
            }}
          >
            No hay productos registrados.
          </p>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px 0" }}>
            Agrega el primer producto para comenzar a administrar tu
            inventario.
          </p>
          <button
            type="button"
            onClick={abrirModalNuevoProducto}
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              border: "none",
              background: "#f59e0b",
              color: "white",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            + Agregar producto
          </button>
        </div>
      )}

      {/* Sin resultados para el filtro/búsqueda actual */}
      {!cargandoProductos &&
        !errorProductos &&
        productos.length > 0 &&
        productosFiltrados.length === 0 && (
          <div
            style={{
              background: "white",
              borderRadius: 14,
              padding: 32,
              textAlign: "center",
              boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            }}
          >
            <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
              No se encontraron productos con ese criterio.
            </p>
          </div>
        )}

      {/* Listado de productos */}
      {!cargandoProductos && !errorProductos && productosFiltrados.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {productosFiltrados.map((producto) => (
            <ProductoCard
              key={producto.id}
              producto={producto}
              onEntrada={(p) => abrirMovimiento(p, "entrada")}
              onSalida={(p) => abrirMovimiento(p, "salida")}
              onAjustar={(p) => abrirMovimiento(p, "ajuste")}
              onEditar={abrirModalEditarProducto}
              onEliminar={setProductoAEliminar}
            />
          ))}
        </div>
      )}

      {/* Historial de movimientos */}
      <HistorialMovimientos
        movimientos={movimientos}
        cargando={cargandoMovimientos}
        error={errorMovimientos}
        onReintentar={estado.cargarMovimientos}
      />

      {/* Modales — cada uno solo existe en el DOM cuando su estado es verdadero */}
      {modalProductoAbierto && (
        <ProductoModal
          productoExistente={productoEnEdicion}
          onCancelar={cerrarModalProducto}
          onCrear={agregarProducto}
          onEditar={editarProducto}
        />
      )}

      {movimientoActual && (
        <MovimientoModal
          contexto={movimientoActual}
          onCancelar={() => setMovimientoActual(null)}
          onRegistrarEntrada={registrarEntrada}
          onRegistrarSalida={registrarSalida}
          onRegistrarAjuste={registrarAjuste}
        />
      )}

      {productoAEliminar && (
        <ConfirmModalInventario
          producto={productoAEliminar}
          onCancelar={() => setProductoAEliminar(null)}
          onConfirmar={async () => {
            await eliminarProducto(productoAEliminar.id);
            setProductoAEliminar(null);
          }}
        />
      )}

      <NotificacionInventario
        notificacion={notificacion}
        onCerrar={cerrarNotificacion}
      />
    </div>
  );
}
