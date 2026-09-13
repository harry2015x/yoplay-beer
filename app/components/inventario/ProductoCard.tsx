"use client";

import { useState } from "react";

import {
  calcularEstadoStock,
  type ProductoInventario,
} from "../../../types/inventario";

import { formatoCOP } from "../../../lib/formato";

import styles from "./inventario.module.css";

type Props = {

  producto: ProductoInventario;


  // ==========================================================
  // PERMISOS
  // ==========================================================

  esAdministrador: boolean;


  // ==========================================================
  // ACCIONES
  // ==========================================================

  onEntrada: (
    producto: ProductoInventario
  ) => void;


  onSalida: (
    producto: ProductoInventario
  ) => void;


  onAjustar: (
    producto: ProductoInventario
  ) => void;


  onEditar: (
    producto: ProductoInventario
  ) => void;


  onEliminar: (
    producto: ProductoInventario
  ) => void;

};

const ESTADO_COLOR: Record<string, string> = {
  normal: "#16a34a",
  bajo: "#f59e0b",
  sin_stock: "#ef4444",
};

const ESTADO_TEXTO: Record<string, string> = {
  normal: "Stock normal",
  bajo: "Stock bajo",
  sin_stock: "Sin stock",
};

function Badge({
  texto,
  color,
}: {
  texto: string;
  color: string;
}) {
  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        color: "white",
        background: color,
        whiteSpace: "nowrap",
      }}
    >
      {texto}
    </span>
  );
}

function BotonAccion({
  etiqueta,
  icono,
  color,
  onClick,
  ariaLabel,
  className,
}: {
  etiqueta: string;
  icono: string;
  color: string;
  onClick: () => void;
  ariaLabel: string;
  className?: string;
}) {
  const [hover, setHover] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={className}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 10px",
        borderRadius: 8,
        border: "none",
        background: color,
        color: "white",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        filter: hover
          ? "brightness(1.07)"
          : "brightness(1)",
        transform: hover
          ? "translateY(-1px)"
          : "translateY(0)",
        transition:
          "filter 120ms ease, transform 120ms ease",
      }}
    >
      <span aria-hidden="true">
        {icono}
      </span>

      <span>
        {etiqueta}
      </span>
    </button>
  );
}

export default function ProductoCard({

  producto,

  esAdministrador,

  onEntrada,

  onSalida,

  onAjustar,

  onEditar,

  onEliminar,

}: Props) {
  const [hover, setHover] = useState(false);

  // Controla si la imagen falla.
  // Si la URL está dañada, mostramos el placeholder.
  const [imagenError, setImagenError] =
    useState(false);

  const estado =
    calcularEstadoStock(producto);

  const tieneImagen =
    producto.imagenUrl &&
    producto.imagenUrl.trim() !== "" &&
    !imagenError;

  return (
    <div
      className={styles.productoCard}
      onMouseEnter={() =>
        setHover(true)
      }
      onMouseLeave={() =>
        setHover(false)
      }
      style={{
        background: "white",
        borderRadius: 14,
        padding: 18,

        boxShadow: hover
          ? "0 10px 24px rgba(0,0,0,0.10)"
          : "0 2px 10px rgba(0,0,0,0.06)",

        transform: hover
          ? "translateY(-2px)"
          : "translateY(0)",

        transition:
          "transform 160ms ease, box-shadow 160ms ease",

        border:
          estado === "sin_stock"
            ? "1px solid #fecaca"
            : estado === "bajo"
            ? "1px solid #fde68a"
            : "1px solid transparent",
      }}
    >
      {/* ============================================== */}
      {/* CABECERA: IMAGEN + INDICADOR + INFORMACIÓN */}
      {/* Se agrupan para que en móvil permanezcan juntos */}
      {/* en una misma fila, incluso cuando el resto de la */}
      {/* tarjeta pasa a una disposición en columna. */}
      {/* ============================================== */}

      <div className={styles.productoCabecera}>

      {/* ============================================== */}
      {/* IMAGEN DEL PRODUCTO */}
      {/* ============================================== */}

      <div
        style={{
          width: 82,
          height: 82,

          borderRadius: 12,

          overflow: "hidden",

          flexShrink: 0,

          background: "#f1f5f9",

          border: "1px solid #e5e7eb",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",
        }}
      >
        {tieneImagen ? (
          <img
            src={producto.imagenUrl ?? ""}
            alt={producto.nombre}
            onError={() =>
              setImagenError(true)
            }
            style={{
              width: "100%",
              height: "100%",

              objectFit: "cover",

              display: "block",
            }}
          />
        ) : (
          <div
            title="Producto sin imagen"
            style={{
              fontSize: 34,

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              width: "100%",

              height: "100%",
            }}
          >
            🍺
          </div>
        )}
      </div>

      {/* ============================================== */}
      {/* INDICADOR DE STOCK */}
      {/* ============================================== */}

      <div
        aria-hidden="true"
        title={ESTADO_TEXTO[estado]}
        style={{
          width: 10,
          height: 10,

          borderRadius: "50%",

          background:
            ESTADO_COLOR[estado],

          flexShrink: 0,

          boxShadow:
            estado === "normal"
              ? "0 0 0 4px rgba(22,163,74,0.10)"
              : estado === "bajo"
              ? "0 0 0 4px rgba(245,158,11,0.10)"
              : "0 0 0 4px rgba(239,68,68,0.10)",
        }}
      />

      {/* ============================================== */}
      {/* INFORMACIÓN DEL PRODUCTO */}
      {/* ============================================== */}

      <div
        style={{
          flex: "1 1 220px",

          minWidth: 200,
        }}
      >
        <div
          style={{
            display: "flex",

            alignItems: "center",

            gap: 8,

            flexWrap: "wrap",

            marginBottom: 5,
          }}
        >
          <span
            style={{
              fontSize: 16,

              fontWeight: 700,

              color: "#111827",
            }}
          >
            {producto.nombre}
          </span>

          <Badge
            texto={
              producto.activo
                ? "Activo"
                : "Inactivo"
            }
            color={
              producto.activo
                ? "#16a34a"
                : "#6b7280"
            }
          />

          {estado !== "normal" && (
            <Badge
              texto={
                ESTADO_TEXTO[estado]
              }
              color={
                ESTADO_COLOR[estado]
              }
            />
          )}
        </div>

        {/* Categoría */}

        <div
          style={{
            fontSize: 13,

            color: "#6b7280",

            marginBottom:
              producto.descripcion
                ? 4
                : 0,
          }}
        >
          🏷️{" "}
          {producto.categoria ??
            "Sin categoría"}
        </div>

        {/* Descripción */}

        {producto.descripcion && (
          <div
            style={{
              fontSize: 12,

              color: "#9ca3af",

              maxWidth: 300,

              overflow: "hidden",

              textOverflow:
                "ellipsis",

              whiteSpace:
                "nowrap",
            }}
            title={
              producto.descripcion
            }
          >
            {producto.descripcion}
          </div>
        )}
      </div>

      </div>
      {/* fin .productoCabecera */}

      {/* ============================================== */}
      {/* MÉTRICAS: STOCK / COMPRA / VENTA */}
      {/* Se agrupan para reorganizarse en móvil sin */}
      {/* perder legibilidad ni cortar textos. */}
      {/* ============================================== */}

      <div className={styles.productoMetricas}>

      {/* ============================================== */}
      {/* STOCK */}
      {/* ============================================== */}

      <div
        className={styles.productoMetrica}
      >
        <div
          style={{
            fontSize: 11,

            color: "#6b7280",

            marginBottom: 3,

            fontWeight: 600,

            textTransform:
              "uppercase",
          }}
        >
          Stock
        </div>

        <div
          style={{
            fontSize: 17,

            fontWeight: 700,

            color:
              estado === "sin_stock"
                ? "#dc2626"
                : estado === "bajo"
                ? "#d97706"
                : "#111827",
          }}
        >
          {producto.stock}{" "}

          <span
            style={{
              fontSize: 12,

              fontWeight: 500,
            }}
          >
            {producto.unidad}
          </span>
        </div>

        <div
          style={{
            fontSize: 11,

            color: "#6b7280",

            marginTop: 2,
          }}
        >
          Mínimo:{" "}
          {producto.stockMinimo}
        </div>
      </div>

      {/* ============================================== */}
      {/* PRECIO DE COMPRA */}
      {/* ============================================== */}

      <div
        className={styles.productoMetrica}
      >
        <div
          style={{
            fontSize: 11,

            color: "#6b7280",

            marginBottom: 3,

            fontWeight: 600,

            textTransform:
              "uppercase",
          }}
        >
          Compra
        </div>

        <div
          style={{
            fontSize: 14,

            fontWeight: 600,

            color: "#374151",
          }}
        >
          {producto.precioCompra !== null
            ? formatoCOP(
                producto.precioCompra
              )
            : "—"}
        </div>
      </div>

      {/* ============================================== */}
      {/* PRECIO DE VENTA */}
      {/* ============================================== */}

      <div
        className={styles.productoMetrica}
      >
        <div
          style={{
            fontSize: 11,

            color: "#6b7280",

            marginBottom: 3,

            fontWeight: 600,

            textTransform:
              "uppercase",
          }}
        >
          Venta
        </div>

        <div
          style={{
            fontSize: 15,

            fontWeight: 700,

            color: "#16a34a",
          }}
        >
          {producto.precioVenta !== null
            ? formatoCOP(
                producto.precioVenta
              )
            : "—"}
        </div>
      </div>

      </div>
      {/* fin .productoMetricas */}

     {/* ============================================== */}
{/* ACCIONES */}
{/* ============================================== */}

{esAdministrador && (

<div
  className={styles.productoAcciones}
>


  {/* ========================================== */}
  {/* ENTRADA */}
  {/* ========================================== */}

  <BotonAccion

    etiqueta="Entrada"

    icono="📥"

    color="#16a34a"

    onClick={() =>

      onEntrada(producto)

    }

    ariaLabel={
      `Registrar entrada para ${producto.nombre}`
    }

  />


  {/* ========================================== */}
  {/* SALIDA */}
  {/* ========================================== */}

  <BotonAccion

    etiqueta="Salida"

    icono="➖"

    color="#ef4444"

    onClick={() =>

      onSalida(producto)

    }

    ariaLabel={
      `Registrar salida para ${producto.nombre}`
    }

  />


  {/* ========================================== */}
  {/* AJUSTAR */}
  {/* ========================================== */}

  <BotonAccion

    etiqueta="Ajustar"

    icono="⚙️"

    color="#2563eb"

    onClick={() =>

      onAjustar(producto)

    }

    ariaLabel={
      `Ajustar stock de ${producto.nombre}`
    }

  />


  {/* ========================================== */}
  {/* EDITAR */}
  {/* ========================================== */}

  <BotonAccion

    etiqueta="Editar"

    icono="✏️"

    color="#172131"

    onClick={() =>

      onEditar(producto)

    }

    ariaLabel={
      `Editar ${producto.nombre}`
    }

  />


  {/* ========================================== */}
  {/* ELIMINAR */}
  {/* ========================================== */}

  <BotonAccion
    etiqueta="Eliminar"
    icono="🗑️"
    color="#ef4444"
    className={styles.accionEliminar}
    onClick={() =>
      onEliminar(producto)
    }
    ariaLabel={
      `Eliminar ${producto.nombre}`
    }
  />

</div>

)}

    </div>
  );
}