// ARCHIVO: app/components/inventario/ProductoModal.tsx

"use client";

import { useEffect, useState } from "react";

import type {
  EdicionProductoInput,
  NuevoProductoInput,
  ProductoInventario,
} from "../../../types/inventario";

import { supabase } from "../../../lib/supabase";

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

  // ==========================================================
  // ESTADOS
  // ==========================================================

  const [form, setForm] =
    useState<FormState>(
      estadoInicial(productoExistente)
    );

  const [guardando, setGuardando] =
    useState(false);

  // Archivo seleccionado desde el computador
  const [imagenArchivo, setImagenArchivo] =
    useState<File | null>(null);

  // URL para mostrar la vista previa
  const [vistaPrevia, setVistaPrevia] =
    useState<string>(
      productoExistente?.imagenUrl ?? ""
    );

  // Indica si el usuario desea eliminar la imagen actual
  const [eliminarImagen, setEliminarImagen] =
    useState(false);

  // ==========================================================
  // EDICION
  // ==========================================================

  const esEdicion =
    productoExistente !== null;


  // ==========================================================
  // LIBERAR URL TEMPORAL
  // ==========================================================

  useEffect(() => {

    return () => {

      if (
        vistaPrevia &&
        vistaPrevia.startsWith("blob:")
      ) {
        URL.revokeObjectURL(vistaPrevia);
      }

    };

  }, [vistaPrevia]);


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
  // SELECCIONAR IMAGEN
  // ==========================================================

  function manejarSeleccionImagen(
    evento: React.ChangeEvent<HTMLInputElement>
  ) {

    const archivo =
      evento.target.files?.[0];

    if (!archivo) {
      return;
    }


    // Validar tipo de archivo

    if (
      !archivo.type.startsWith("image/")
    ) {

      alert(
        "Por favor selecciona un archivo de imagen válido."
      );

      return;

    }


    // Tamaño máximo: 5 MB

    const tamañoMaximo =
      5 * 1024 * 1024;

    if (
      archivo.size > tamañoMaximo
    ) {

      alert(
        "La imagen no puede superar los 5 MB."
      );

      return;

    }


    // Eliminar preview anterior temporal

    if (
      vistaPrevia &&
      vistaPrevia.startsWith("blob:")
    ) {

      URL.revokeObjectURL(
        vistaPrevia
      );

    }


    // Crear URL temporal

    const nuevaVistaPrevia =
      URL.createObjectURL(archivo);


    setImagenArchivo(
      archivo
    );


    setVistaPrevia(
      nuevaVistaPrevia
    );


    setEliminarImagen(
      false
    );

  }


  // ==========================================================
  // ELIMINAR IMAGEN
  // ==========================================================

  function manejarEliminarImagen() {

    if (
      vistaPrevia &&
      vistaPrevia.startsWith("blob:")
    ) {

      URL.revokeObjectURL(
        vistaPrevia
      );

    }


    setImagenArchivo(
      null
    );


    setVistaPrevia(
      ""
    );


    setEliminarImagen(
      true
    );


    setForm((prev) => ({
      ...prev,
      imagenUrl: "",
    }));

  }


  // ==========================================================
  // SUBIR IMAGEN A SUPABASE STORAGE
  // ==========================================================

  async function subirImagen(): Promise<
    string | null
  > {

    // Si no hay una nueva imagen seleccionada,
    // conservar la actual.

    if (!imagenArchivo) {

      if (eliminarImagen) {
        return null;
      }

      return form.imagenUrl || null;

    }


    // Obtener extensión

    const nombreArchivo =
      imagenArchivo.name;


    const extension =
      nombreArchivo.includes(".")
        ? nombreArchivo
            .split(".")
            .pop()
            ?.toLowerCase()
        : "jpg";


    // Crear nombre único

    const nombreUnico =
      `${Date.now()}-${crypto.randomUUID()}.${extension}`;


    // Carpeta dentro del bucket

    const rutaArchivo =
      `productos/${nombreUnico}`;


    // Subir imagen

    const {
      error: errorSubida,
    } = await supabase.storage
      .from("productos")
      .upload(
        rutaArchivo,
        imagenArchivo,
        {
          cacheControl: "3600",
          upsert: false,
          contentType:
            imagenArchivo.type,
        }
      );


    if (errorSubida) {

      console.error(
        "Error al subir imagen:",
        errorSubida
      );


      alert(
        `Error al subir la imagen: ${errorSubida.message}`
      );


      throw errorSubida;

    }


    // Obtener URL pública

    const {
      data: datosPublicos,
    } = supabase.storage
      .from("productos")
      .getPublicUrl(
        rutaArchivo
      );


    return (
      datosPublicos.publicUrl
    );

  }


  // ==========================================================
  // GUARDAR
  // ==========================================================

  async function manejarSubmit(
    evento: React.FormEvent
  ) {

    evento.preventDefault();


    setGuardando(
      true
    );


    try {

      // ======================================================
      // PRECIOS
      // ======================================================

      const precioCompra =
        form.precioCompra.trim() === ""
          ? null
          : Number(
              form.precioCompra
            );


      const precioVenta =
        form.precioVenta.trim() === ""
          ? null
          : Number(
              form.precioVenta
            );


      // ======================================================
      // SUBIR IMAGEN
      // ======================================================

      const imagenUrl =
        await subirImagen();


      let exito =
        false;


      // ======================================================
      // EDITAR
      // ======================================================

      if (
        esEdicion &&
        productoExistente
      ) {

        const input:
          EdicionProductoInput = {

          nombre:
            form.nombre.trim(),

          descripcion:
            form.descripcion.trim(),

          categoria:
            form.categoria.trim(),

          stockMinimo:
            Number(
              form.stockMinimo
            ),

          unidad:
            form.unidad.trim(),

          precioCompra,

          precioVenta,

          imagenUrl,

          activo:
            form.activo,

        };


        exito =
          await onEditar(
            productoExistente.id,
            input
          );

      }


      // ======================================================
      // CREAR
      // ======================================================

      else {

        const input:
          NuevoProductoInput = {

          nombre:
            form.nombre.trim(),

          descripcion:
            form.descripcion.trim(),

          categoria:
            form.categoria.trim(),

          stock:
            Number(
              form.stock
            ),

          stockMinimo:
            Number(
              form.stockMinimo
            ),

          unidad:
            form.unidad.trim(),

          precioCompra,

          precioVenta,

          imagenUrl,

          activo:
            form.activo,

        };


        exito =
          await onCrear(
            input
          );

      }


      // ======================================================
      // CERRAR MODAL
      // ======================================================

      if (exito) {

        onCancelar();

      }

    }

    catch (error) {

      console.error(
        "Error guardando producto:",
        error
      );

    }

    finally {

      setGuardando(
        false
      );

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


          {/* =============================================== */}
          {/* CAMPOS */}
          {/* =============================================== */}

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
                  placeholder="Botella 330 ml"
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
            {/* IMAGEN DEL PRODUCTO */}
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


                <div
                  style={{
                    border:
                      "2px dashed #cbd5e1",
                    borderRadius: 12,
                    padding: 18,
                    background:
                      "#f8fafc",
                  }}
                >


                  <input
                    id="imagen-producto"
                    type="file"
                    accept="image/*"
                    onChange={
                      manejarSeleccionImagen
                    }
                    style={{
                      display:
                        "none",
                    }}
                  />


                  {/* BOTON SELECCIONAR */}

                  <label
                    htmlFor="imagen-producto"
                    style={{
                      display:
                        "inline-flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      gap: 8,
                      padding:
                        "10px 16px",
                      borderRadius: 8,
                      background:
                        "#2563eb",
                      color:
                        "white",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor:
                        guardando
                          ? "default"
                          : "pointer",
                    }}
                  >

                    📁 Seleccionar imagen

                  </label>


                  <p
                    style={{
                      margin:
                        "10px 0 0",
                      fontSize: 12,
                      color:
                        "#64748b",
                    }}
                  >

                    JPG, PNG, WEBP u otros formatos de imagen.
                    Tamaño máximo: 5 MB.

                  </p>


                  {/* VISTA PREVIA */}

                  {vistaPrevia && (

                    <div
                      style={{
                        marginTop: 16,
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap: 16,
                        padding: 12,
                        border:
                          "1px solid #e5e7eb",
                        borderRadius: 10,
                        background:
                          "white",
                      }}
                    >


                      <img
                        src={
                          vistaPrevia
                        }
                        alt="Vista previa del producto"
                        style={{
                          width: 100,
                          height: 100,
                          objectFit:
                            "cover",
                          borderRadius: 10,
                          border:
                            "1px solid #e5e7eb",
                        }}
                      />


                      <div
                        style={{
                          flex: 1,
                        }}
                      >

                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color:
                              "#111827",
                            marginBottom: 4,
                          }}
                        >

                          🖼️ Vista previa

                        </div>


                        {imagenArchivo && (

                          <div
                            style={{
                              fontSize: 12,
                              color:
                                "#64748b",
                            }}
                          >

                            {imagenArchivo.name}

                          </div>

                        )}


                        <button
                          type="button"
                          onClick={
                            manejarEliminarImagen
                          }
                          disabled={
                            guardando
                          }
                          style={{
                            marginTop: 10,
                            padding:
                              "7px 10px",
                            borderRadius: 7,
                            border:
                              "none",
                            background:
                              "#fee2e2",
                            color:
                              "#dc2626",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor:
                              guardando
                                ? "default"
                                : "pointer",
                          }}
                        >

                          🗑️ Quitar imagen

                        </button>

                      </div>

                    </div>

                  )}

                </div>

              </Campo>

            </div>


            {/* PRODUCTO ACTIVO */}

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
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


          {/* =============================================== */}
          {/* INFORMACION DE EDICION */}
          {/* =============================================== */}

          {esEdicion && (

            <p
              style={{
                fontSize: 12,
                color: "#6b7280",
                background:
                  "#f4f6f8",
                borderRadius: 8,
                padding:
                  "10px 12px",
                marginBottom: 16,
              }}
            >

              El stock no se edita aquí.
              Usa los botones de{" "}

              <strong>
                Entrada
              </strong>

              ,{" "}

              <strong>
                Salida
              </strong>

              o{" "}

              <strong>
                Ajustar
              </strong>

              {" "}en la tarjeta del producto.

            </p>

          )}


          {/* =============================================== */}
          {/* BOTONES */}
          {/* =============================================== */}

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent:
                "flex-end",
              marginTop: 8,
            }}
          >


            {/* CANCELAR */}

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
                background:
                  "white",
                color:
                  "#374151",
                fontWeight: 600,
                cursor:
                  guardando
                    ? "default"
                    : "pointer",
              }}
            >

              Cancelar

            </button>


            {/* GUARDAR */}

            <button
              type="submit"
              disabled={guardando}
              style={{
                padding:
                  "10px 16px",
                borderRadius: 8,
                border:
                  "none",
                background:
                  "#2563eb",
                color:
                  "white",
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
                ? "Subiendo y guardando..."
                : "Guardar"}

            </button>


          </div>


        </form>


      </div>


    </div>

  );

}