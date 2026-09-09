"use client";

import { useState } from "react";

import type {
  EdicionProductoInput,
  NuevoProductoInput,
  ProductoInventario,
} from "../../../types/inventario";

import styles from "./inventario.module.css";

// ============================================================
// PROPS
// ============================================================

type Props = {
  productoExistente: ProductoInventario | null;

  onCancelar: () => void;

  onCrear: (
    input: NuevoProductoInput
  ) => Promise<boolean>;

  onEditar: (
    id: number,
    input: EdicionProductoInput
  ) => Promise<boolean>;
};

// ============================================================
// ESTADO DEL FORMULARIO
// ============================================================

type FormState = {
  nombre: string;

  descripcion: string;

  categoria: string;

  stock: string;

  stockMinimo: string;

  unidad: string;

  precioCompra: string;

  precioVenta: string;

  // NUEVO
  imagenUrl: string;

  activo: boolean;
};

// ============================================================
// ESTADO INICIAL
// ============================================================

function estadoInicial(
  producto: ProductoInventario | null
): FormState {
  if (!producto) {
    return {
      nombre: "",
      descripcion: "",
      categoria: "",
      stock: "0",
      stockMinimo: "0",
      unidad: "unidad",
      precioCompra: "",
      precioVenta: "",

      // NUEVO
      imagenUrl: "",

      activo: true,
    };
  }

  return {
    nombre: producto.nombre,

    descripcion:
      producto.descripcion ?? "",

    categoria:
      producto.categoria ?? "",

    stock:
      String(producto.stock),

    stockMinimo:
      String(producto.stockMinimo),

    unidad:
      producto.unidad,

    precioCompra:
      producto.precioCompra !== null
        ? String(producto.precioCompra)
        : "",

    precioVenta:
      producto.precioVenta !== null
        ? String(producto.precioVenta)
        : "",

    // NUEVO
    imagenUrl:
      producto.imagenUrl ?? "",

    activo:
      producto.activo,
  };
}

// ============================================================
// ESTILOS
// ============================================================

const estiloInput: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  fontSize: 15,
  color: "#111827",
  boxSizing: "border-box",
  fontFamily: "Arial, sans-serif",
};

const estiloLabel: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
  marginBottom: 6,
};

// ============================================================
// COMPONENTE CAMPO
// ============================================================

function Campo({
  etiqueta,
  requerido,
  children,
}: {
  etiqueta: string;

  requerido?: boolean;

  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={estiloLabel}>
        {etiqueta}

        {requerido && (
          <span
            style={{
              color: "#ef4444",
            }}
          >
            {" "}
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

// ============================================================
// MODAL
// ============================================================

export default function ProductoModal({
  productoExistente,
  onCancelar,
  onCrear,
  onEditar,
}: Props) {
  const [form, setForm] =
    useState<FormState>(
      estadoInicial(productoExistente)
    );

  const [guardando, setGuardando] =
    useState(false);

  const esEdicion =
    productoExistente !== null;

  // ==========================================================
  // ACTUALIZAR CAMPO
  // ==========================================================

  function actualizar<
    K extends keyof FormState
  >(
    campo: K,
    valor: FormState[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  // ==========================================================
  // GUARDAR
  // ==========================================================

  async function manejarSubmit(
    evento: React.FormEvent
  ) {
    evento.preventDefault();

    setGuardando(true);

    const precioCompra =
      form.precioCompra.trim() === ""
        ? null
        : Number(form.precioCompra);

    const precioVenta =
      form.precioVenta.trim() === ""
        ? null
        : Number(form.precioVenta);

    let exito = false;

    // ========================================================
    // EDITAR
    // ========================================================

    if (
      esEdicion &&
      productoExistente
    ) {
      const input: EdicionProductoInput = {
        nombre:
          form.nombre,

        descripcion:
          form.descripcion,

        categoria:
          form.categoria,

        stockMinimo:
          Number(form.stockMinimo),

        unidad:
          form.unidad,

        precioCompra,

        precioVenta,

        // NUEVO
        imagenUrl:
          form.imagenUrl.trim() === ""
            ? null
            : form.imagenUrl.trim(),

        activo:
          form.activo,
      };

      exito =
        await onEditar(
          productoExistente.id,
          input
        );
    }

    // ========================================================
    // CREAR
    // ========================================================

    else {
      const input: NuevoProductoInput = {
        nombre:
          form.nombre,

        descripcion:
          form.descripcion,

        categoria:
          form.categoria,

        stock:
          Number(form.stock),

        stockMinimo:
          Number(form.stockMinimo),

        unidad:
          form.unidad,

        precioCompra,

        precioVenta,

        // NUEVO
        imagenUrl:
          form.imagenUrl.trim() === ""
            ? null
            : form.imagenUrl.trim(),

        activo:
          form.activo,
      };

      exito =
        await onCrear(input);
    }

    setGuardando(false);

    if (exito) {
      onCancelar();
    }
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={onCancelar}
      style={{
        position: "fixed",
        inset: 0,
        background:
          "rgba(15, 23, 42, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 16,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="producto-modal-titulo"
        onClick={(evento) =>
          evento.stopPropagation()
        }
        className={styles.modal}
        style={{
          background: "white",
          borderRadius: 18,
          width: "100%",
          maxWidth: 700,
          maxHeight: "88vh",
          overflowY: "auto",
          boxShadow:
            "0 25px 50px rgba(0,0,0,0.25)",
          padding: 24,
        }}
      >
        {/* ================================================= */}
        {/* TITULO */}
        {/* ================================================= */}

        <h2
          id="producto-modal-titulo"
          style={{
            fontSize: 19,
            fontWeight: 700,
            color: "#111827",
            margin:
              "0 0 18px 0",
          }}
        >
          {esEdicion
            ? "✏️ Editar producto"
            : "➕ Nuevo producto"}
        </h2>

        <form
          onSubmit={manejarSubmit}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
              marginBottom: 16,
            }}
          >
            {/* NOMBRE */}

            <div
              style={{
                gridColumn:
                  "1 / -1",
              }}
            >
              <Campo
                etiqueta="Nombre"
                requerido
              >
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) =>
                    actualizar(
                      "nombre",
                      e.target.value
                    )
                  }
                  required
                  style={estiloInput}
                  placeholder="Cerveza Poker"
                />
              </Campo>
            </div>

            {/* DESCRIPCION */}

            <div
              style={{
                gridColumn:
                  "1 / -1",
              }}
            >
              <Campo
                etiqueta="Descripción"
              >
                <input
                  type="text"
                  value={
                    form.descripcion
                  }
                  onChange={(e) =>
                    actualizar(
                      "descripcion",
                      e.target.value
                    )
                  }
                  style={estiloInput}
                  placeholder="Botella 330ml"
                />
              </Campo>
            </div>

            {/* CATEGORIA */}

            <Campo
              etiqueta="Categoría"
            >
              <input
                type="text"
                value={
                  form.categoria
                }
                onChange={(e) =>
                  actualizar(
                    "categoria",
                    e.target.value
                  )
                }
                style={estiloInput}
                placeholder="Cervezas"
              />
            </Campo>

            {/* UNIDAD */}

            <Campo
              etiqueta="Unidad"
            >
              <input
                type="text"
                value={
                  form.unidad
                }
                onChange={(e) =>
                  actualizar(
                    "unidad",
                    e.target.value
                  )
                }
                style={estiloInput}
                placeholder="unidad, caja, botella..."
              />
            </Campo>

            {/* STOCK INICIAL */}

            {!esEdicion && (
              <Campo
                etiqueta="Stock inicial"
                requerido
              >
                <input
                  type="number"
                  min={0}
                  step="1"
                  value={
                    form.stock
                  }
                  onChange={(e) =>
                    actualizar(
                      "stock",
                      e.target.value
                    )
                  }
                  required
                  style={estiloInput}
                />
              </Campo>
            )}

            {/* STOCK MINIMO */}

            <Campo
              etiqueta="Stock mínimo"
              requerido
            >
              <input
                type="number"
                min={0}
                step="1"
                value={
                  form.stockMinimo
                }
                onChange={(e) =>
                  actualizar(
                    "stockMinimo",
                    e.target.value
                  )
                }
                required
                style={estiloInput}
              />
            </Campo>

            {/* PRECIO COMPRA */}

            <Campo
              etiqueta="Precio de compra"
            >
              <input
                type="number"
                min={0}
                step="any"
                value={
                  form.precioCompra
                }
                onChange={(e) =>
                  actualizar(
                    "precioCompra",
                    e.target.value
                  )
                }
                style={estiloInput}
                placeholder="0"
              />
            </Campo>

            {/* PRECIO VENTA */}

            <Campo
              etiqueta="Precio de venta"
            >
              <input
                type="number"
                min={0}
                step="any"
                value={
                  form.precioVenta
                }
                onChange={(e) =>
                  actualizar(
                    "precioVenta",
                    e.target.value
                  )
                }
                style={estiloInput}
                placeholder="0"
              />
            </Campo>

            {/* ============================================= */}
            {/* IMAGEN */}
            {/* ============================================= */}

            <div
              style={{
                gridColumn:
                  "1 / -1",
              }}
            >
              <Campo
                etiqueta="Imagen del producto"
              >
                <input
                  type="url"
                  value={
                    form.imagenUrl
                  }
                  onChange={(e) =>
                    actualizar(
                      "imagenUrl",
                      e.target.value
                    )
                  }
                  style={estiloInput}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </Campo>

              {/* VISTA PREVIA */}

              {form.imagenUrl.trim() !== "" && (
                <div
                  style={{
                    marginTop: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: 12,
                    border:
                      "1px solid #e5e7eb",
                    borderRadius: 10,
                    background:
                      "#f8fafc",
                  }}
                >
                  <img
                    src={form.imagenUrl}
                    alt="Vista previa"
                    style={{
                      width: 100,
                      height: 100,
                      objectFit: "cover",
                      borderRadius: 10,
                      border:
                        "1px solid #e5e7eb",
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display =
                        "none";
                    }}
                  />

                  <div
                    style={{
                      fontSize: 13,
                      color:
                        "#6b7280",
                    }}
                  >
                    🖼️ Vista previa de la imagen
                  </div>
                </div>
              )}
            </div>

            {/* PRODUCTO ACTIVO */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 20,
              }}
            >
              <input
                id="producto-activo"
                type="checkbox"
                checked={
                  form.activo
                }
                onChange={(e) =>
                  actualizar(
                    "activo",
                    e.target.checked
                  )
                }
                style={{
                  width: 18,
                  height: 18,
                }}
              />

              <label
                htmlFor="producto-activo"
                style={{
                  fontSize: 14,
                  color: "#374151",
                  fontWeight: 600,
                }}
              >
                Producto activo
              </label>
            </div>
          </div>

          {/* INFORMACION DE EDICION */}

          {esEdicion && (
            <p
              style={{
                fontSize: 12,
                color: "#6b7280",
                background: "#f4f6f8",
                borderRadius: 8,
                padding: "10px 12px",
                marginBottom: 16,
              }}
            >
              El stock no se edita aquí. Usa los botones de{" "}
              <strong>Entrada</strong>,{" "}
              <strong>Salida</strong> o{" "}
              <strong>Ajustar</strong>{" "}
              en la tarjeta del producto.
            </p>
          )}

          {/* BOTONES */}

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent:
                "flex-end",
              marginTop: 8,
            }}
          >
            <button
              type="button"
              onClick={onCancelar}
              disabled={guardando}
              style={{
                padding:
                  "10px 16px",
                borderRadius: 8,
                border:
                  "1px solid #d1d5db",
                background: "white",
                color: "#374151",
                fontWeight: 600,
                cursor:
                  guardando
                    ? "default"
                    : "pointer",
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={guardando}
              style={{
                padding:
                  "10px 16px",
                borderRadius: 8,
                border: "none",
                background: "#2563eb",
                color: "white",
                fontWeight: 600,
                cursor:
                  guardando
                    ? "default"
                    : "pointer",
                opacity:
                  guardando
                    ? 0.7
                    : 1,
              }}
            >
              {guardando
                ? "Guardando..."
                : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}