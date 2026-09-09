"use client";

import { useEffect, useState } from "react";
import { Mesa, formatoCOP } from "../../../types/mesas";
import { ProductoInventario } from "../../../types/inventario";
import { supabase } from "../../../lib/supabase";
import PedidoActual from "./PedidoActual";

type ProductoMesa = {
  id: number;
  nombre: string;
  precio: number;
};

type Props = {
  mesa: Mesa;
  onCerrarModal: () => void;
  onAgregarProducto: (producto: ProductoMesa) => void;
  onAumentar: (productoId: number) => void;
  onDisminuir: (productoId: number) => void;
  onEliminar: (productoId: number) => void;
  onSolicitarCierre: (mesa: Mesa) => void;
};

export default function MesaModal({
  mesa,
  onCerrarModal,
  onAgregarProducto,
  onAumentar,
  onDisminuir,
  onEliminar,
  onSolicitarCierre,
}: Props) {
  const [productos, setProductos] = useState<ProductoInventario[]>([]);
  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [errorProductos, setErrorProductos] = useState<string | null>(null);

  useEffect(() => {
    async function cargarProductos() {
      setCargandoProductos(true);
      setErrorProductos(null);

      const { data, error } = await supabase
        .from("productos")
        .select(`
          id,
          nombre,
          descripcion,
          categoria,
          cantidad,
          cantidad_minima,
          unidad,
          precio_compra,
          precio_venta,
          activo,
          imagen_url,
          created_at
        `)
        .eq("activo", true)
        .order("nombre", { ascending: true });

      if (error) {
        console.error("Error cargando productos:", error);
        setErrorProductos("No fue posible cargar los productos.");
        setCargandoProductos(false);
        return;
      }

      const productosConvertidos: ProductoInventario[] =
        (data ?? []).map((producto) => ({
          id: producto.id,
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          categoria: producto.categoria,
          stock: producto.cantidad ?? 0,
          stockMinimo: producto.cantidad_minima ?? 0,
          unidad: producto.unidad ?? "unidad",
          precioCompra: producto.precio_compra,
          precioVenta: producto.precio_venta,
          activo: producto.activo ?? true,
          imagenUrl: producto.imagen_url ?? null,
          createdAt: producto.created_at,
        }));

      setProductos(productosConvertidos);
      setCargandoProductos(false);
    }

    cargarProductos();
  }, []);

  return (
    <div
      role="presentation"
      onClick={onCerrarModal}
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
        aria-labelledby="mesa-modal-title"
        onClick={(evento) => evento.stopPropagation()}
        className="mesas-modal-entrada"
        style={{
          background: "white",
          borderRadius: "18px",
          width: "100%",
          maxWidth: "900px",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
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
          <div>
            <h2 id="mesa-modal-title" style={{ margin: 0 }}>
              🪑 Mesa {mesa.numero}
            </h2>

            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: "999px",
                background: "#fef3c7",
                color: "#92400e",
              }}
            >
              OCUPADA
            </span>
          </div>

          <button
            onClick={onCerrarModal}
            aria-label="Cerrar panel de la mesa"
            className="mesa-btn"
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

        {/* CONTENIDO */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(220px, 1fr) minmax(280px, 1.2fr)",
            gap: "20px",
            padding: "20px 24px",
            overflowY: "auto",
          }}
        >
          {/* PRODUCTOS */}
          <div>
            <h3 style={{ marginTop: 0 }}>📦 Productos</h3>

            {cargandoProductos && (
              <p style={{ color: "#6b7280" }}>
                Cargando productos...
              </p>
            )}

            {errorProductos && (
              <p style={{ color: "#dc2626" }}>
                {errorProductos}
              </p>
            )}

            {!cargandoProductos &&
              !errorProductos &&
              productos.length === 0 && (
                <p style={{ color: "#6b7280" }}>
                  No hay productos disponibles.
                </p>
              )}

            {!cargandoProductos &&
              productos.map((producto) => {
                const sinStock = producto.stock <= 0;

                return (
                  <div
                    key={producto.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "10px",
                      padding: "12px 0",
                      borderBottom: "1px solid #e5e7eb",
                      opacity: sinStock ? 0.6 : 1,
                    }}
                  >
                    {/* IMAGEN */}
                    <div
                      style={{
                        width: "52px",
                        height: "52px",
                        borderRadius: "10px",
                        background: "#f3f4f6",
                        overflow: "hidden",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {producto.imagenUrl ? (
                        <img
                          src={producto.imagenUrl}
                          alt={producto.nombre}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: "24px" }}>
                          📦
                        </span>
                      )}
                    </div>

                    {/* INFORMACIÓN */}
                    <div style={{ flex: 1 }}>
                      <strong>{producto.nombre}</strong>

                      <br />

                      <span
                        style={{
                          color: "#6b7280",
                          fontSize: "14px",
                        }}
                      >
                        {producto.precioVenta !== null
                          ? formatoCOP(producto.precioVenta)
                          : "Precio no definido"}
                      </span>

                      <br />

                      <span
                        style={{
                          fontSize: "12px",
                          color: sinStock
                            ? "#dc2626"
                            : "#16a34a",
                        }}
                      >
                        {sinStock
                          ? "Sin stock"
                          : `${producto.stock} ${producto.unidad}`}
                      </span>
                    </div>

                    {/* BOTÓN */}
                    <button
                      onClick={() =>
                        onAgregarProducto({
                          id: producto.id,
                          nombre: producto.nombre,
                          precio: producto.precioVenta ?? 0,
                        })
                      }
                      disabled={sinStock}
                      aria-label={`Agregar ${producto.nombre} a la mesa ${mesa.numero}`}
                      className="mesa-btn"
                      style={{
                        background: sinStock
                          ? "#9ca3af"
                          : "#16a34a",
                        color: "white",
                        border: "none",
                        padding: "8px 14px",
                        borderRadius: "8px",
                        cursor: sinStock
                          ? "not-allowed"
                          : "pointer",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {sinStock ? "Sin stock" : "+ Agregar"}
                    </button>
                  </div>
                );
              })}
          </div>

          {/* PEDIDO */}
          <PedidoActual
            productos={mesa.productos}
            total={mesa.total}
            onAumentar={onAumentar}
            onDisminuir={onDisminuir}
            onEliminar={onEliminar}
            onSolicitarCierre={() => onSolicitarCierre(mesa)}
          />
        </div>
      </div>
    </div>
  );
}