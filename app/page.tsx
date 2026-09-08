"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
type Producto = {
  id: number;
  nombre: string;
  precio: number;
};

type ItemMesa = {
  productoId: number;
  nombre: string;
  precio: number;
  cantidad: number;
};

type Mesa = {
  id: number;
  estado: "Libre" | "Ocupada";
  total: number;
  productos: ItemMesa[];
};

type Venta = {
  id: number;
  mesa: number;
  total: number;
  fecha: Date;
};

export default function Home() {

  const [seccion, setSeccion] = useState("Inicio");

  const [mesaSeleccionada, setMesaSeleccionada] =
    useState<number | null>(null);

    useEffect(() => {
      cargarMesas();
    }, []);
    
    const cargarMesas = async () => {
      const { data, error } = await supabase
        .from("mesas")
        .select("*")
        .order("numero");
    
      if (error) {
        console.error(error);
        return;
      }
    
      if (data) {
        const mesasSupabase: Mesa[] = data.map((mesa) => ({
          id: mesa.numero,
          estado:
            mesa.estado === "ocupada"
              ? "Ocupada"
              : "Libre",
          total: 0,
          productos: [],
        }));
    
        setMesas(mesasSupabase);
      }
    };

  const [mesas, setMesas] = useState<Mesa[]>([]);

  useEffect(() => {
    cargarMesas();
  }, []);
  
  

  const [ventas, setVentas] = useState<Venta[]>([]);

  const productos: Producto[] = [
    {
      id: 1,
      nombre: "Cerveza",
      precio: 5000,
    },
    {
      id: 2,
      nombre: "Águila",
      precio: 6000,
    },
    {
      id: 3,
      nombre: "Gaseosa",
      precio: 5000,
    },
    {
      id: 4,
      nombre: "Agua",
      precio: 3000,
    },
    {
      id: 5,
      nombre: "Papas",
      precio: 7000,
    },
    {
      id: 6,
      nombre: "Whisky",
      precio: 12000,
    },
  ];

  const abrirMesa = (id: number) => {
    setMesas(
      mesas.map((mesa) =>
        mesa.id === id
          ? {
              ...mesa,
              estado: "Ocupada",
            }
          : mesa
      )
    );

    setMesaSeleccionada(id);
  };

  const seleccionarMesa = (id: number) => {
    setMesaSeleccionada(id);
  };

  const agregarProducto = (producto: Producto) => {
    if (!mesaSeleccionada) return;

    setMesas(
      mesas.map((mesa) => {
        if (mesa.id !== mesaSeleccionada) {
          return mesa;
        }

        const productoExistente =
          mesa.productos.find(
            (item) =>
              item.productoId === producto.id
          );

        let nuevosProductos;

        if (productoExistente) {
          nuevosProductos =
            mesa.productos.map((item) =>
              item.productoId === producto.id
                ? {
                    ...item,
                    cantidad:
                      item.cantidad + 1,
                  }
                : item
            );
        } else {
          nuevosProductos = [
            ...mesa.productos,
            {
              productoId: producto.id,
              nombre: producto.nombre,
              precio: producto.precio,
              cantidad: 1,
            },
          ];
        }

        const nuevoTotal =
          nuevosProductos.reduce(
            (total, item) =>
              total +
              item.precio * item.cantidad,
            0
          );

        return {
          ...mesa,
          productos: nuevosProductos,
          total: nuevoTotal,
        };
      })
    );
  };

  const aumentarCantidad = (
    productoId: number
  ) => {
    if (!mesaSeleccionada) return;

    setMesas(
      mesas.map((mesa) => {
        if (mesa.id !== mesaSeleccionada) {
          return mesa;
        }

        const nuevosProductos =
          mesa.productos.map((item) =>
            item.productoId === productoId
              ? {
                  ...item,
                  cantidad:
                    item.cantidad + 1,
                }
              : item
          );

        const nuevoTotal =
          nuevosProductos.reduce(
            (total, item) =>
              total +
              item.precio * item.cantidad,
            0
          );

        return {
          ...mesa,
          productos: nuevosProductos,
          total: nuevoTotal,
        };
      })
    );
  };

  const disminuirCantidad = (
    productoId: number
  ) => {
    if (!mesaSeleccionada) return;

    setMesas(
      mesas.map((mesa) => {
        if (mesa.id !== mesaSeleccionada) {
          return mesa;
        }

        const nuevosProductos =
          mesa.productos
            .map((item) =>
              item.productoId === productoId
                ? {
                    ...item,
                    cantidad:
                      item.cantidad - 1,
                  }
                : item
            )
            .filter(
              (item) => item.cantidad > 0
            );

        const nuevoTotal =
          nuevosProductos.reduce(
            (total, item) =>
              total +
              item.precio * item.cantidad,
            0
          );

        return {
          ...mesa,
          productos: nuevosProductos,
          total: nuevoTotal,
        };
      })
    );
  };

  const cerrarMesa = async (id: number) => {
    const mesa = mesas.find(
      (mesa) => mesa.id === id
    );
  
    if (!mesa) return;
  
    if (mesa.total === 0) {
      alert(
        "No puedes cerrar una mesa sin productos."
      );
  
      return;
    }
  
    const confirmar = window.confirm(
      `¿Deseas cerrar la cuenta de la Mesa ${id}?\n\nTotal: $${mesa.total.toLocaleString(
        "es-CO"
      )}`
    );
  
    if (!confirmar) return;
  
    const { data: ventaCreada, error } =
      await supabase
        .from("ventas")
        .insert([
          {
            mesa_id: id,
            total: mesa.total,
            estado: "cerrada",
          },
        ])
        .select()
        .single();
  
    if (error) {
      console.error(error);
  
      alert(
        "Error al guardar la venta en Supabase."
      );
  
      return;
    }
  
    const nuevaVenta: Venta = {
      id: ventaCreada.id,
      mesa: id,
      total: mesa.total,
      fecha: new Date(),
    };
  
    setVentas([
      ...ventas,
      nuevaVenta,
    ]);
  
    setMesas(
      mesas.map((mesa) =>
        mesa.id === id
          ? {
              ...mesa,
              estado: "Libre",
              total: 0,
              productos: [],
            }
          : mesa
      )
    );
  
    setMesaSeleccionada(null);
  
    alert(
      `Venta registrada correctamente.\n\nTotal: $${mesa.total.toLocaleString(
        "es-CO"
      )}`
    );
  };
  const mesaActual = mesas.find(
    (mesa) =>
      mesa.id === mesaSeleccionada
  );

  const ventasDelDia = ventas.reduce(
    (total, venta) =>
      total + venta.total,
    0
  );

  const menu = [
    "Inicio",
    "Mesas",
    "Ventas",
    "Inventario",
    "Reportes",
    "Usuarios",
  ];

  const iconos: Record<
    string,
    string
  > = {
    Inicio: "🏠",
    Mesas: "🪑",
    Ventas: "💰",
    Inventario: "📦",
    Reportes: "📊",
    Usuarios: "👥",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f6f8",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* ENCABEZADO */}

      <header
        style={{
          background: "#172131",
          color: "white",
          padding: "20px 30px",
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "26px",
            }}
          >
            🍺 YO PLAY BEER
          </h1>

          <p
            style={{
              margin: "5px 0 0",
              color: "#b0bac8",
            }}
          >
            Sistema de ventas e inventario
          </p>
        </div>

        <div
          style={{
            background: "#303d4f",
            padding: "12px 18px",
            borderRadius: "8px",
          }}
        >
          👤 Administrador
        </div>
      </header>

      <div
        style={{
          display: "flex",
        }}
      >
        {/* MENU */}

        <aside
          style={{
            width: "230px",
            minHeight:
              "calc(100vh - 92px)",
            background: "#263344",
            padding: "20px",
          }}
        >
          {menu.map((item) => (
            <button
              key={item}
              onClick={() => {
                setSeccion(item);

                if (
                  item !== "Mesas"
                ) {
                  setMesaSeleccionada(
                    null
                  );
                }
              }}
              style={{
                width: "100%",
                padding: "15px",
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

                fontSize: "16px",
              }}
            >
              {iconos[item]} {item}
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
          {/* INICIO */}

          {seccion === "Inicio" && (
            <>
              <h2>🏠 Inicio</h2>

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
                  valor={`$${ventasDelDia.toLocaleString(
                    "es-CO"
                  )}`}
                  icono="💰"
                />

                <Tarjeta
                  titulo="Mesas activas"
                  valor={mesas
                    .filter(
                      (mesa) =>
                        mesa.estado ===
                        "Ocupada"
                    )
                    .length.toString()}
                  icono="🪑"
                />

                <Tarjeta
                  titulo="Productos"
                  valor={
                    productos.length.toString()
                  }
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
                <h3>
                  Bienvenido a YO PLAY BEER
                  🍺
                </h3>

                <p
                  style={{
                    color: "#6b7280",
                  }}
                >
                  Desde este sistema podrás
                  administrar las ventas,
                  mesas, inventario y
                  reportes del negocio.
                </p>
              </div>
            </>
          )}

          {/* MESAS */}

          {seccion === "Mesas" &&
            !mesaSeleccionada && (
              <>
                <h2>
                  🪑 Gestión de Mesas
                </h2>

                <p
                  style={{
                    color: "#6b7280",
                  }}
                >
                  Selecciona una mesa para
                  registrar productos o
                  cerrar una cuenta.
                </p>

                <div
                  style={{
                    display: "grid",

                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(180px, 1fr))",

                    gap: "20px",

                    marginTop: "30px",
                  }}
                >
                  {mesas.map(
                    (mesa) => (
                      <div
                        key={mesa.id}
                        style={{
                          background:
                            "white",

                          padding:
                            "20px",

                          borderRadius:
                            "12px",

                          textAlign:
                            "center",

                          boxShadow:
                            "0 2px 10px rgba(0,0,0,0.08)",

                          borderTop:
                            mesa.estado ===
                            "Libre"
                              ? "5px solid #22c55e"
                              : "5px solid #ef4444",
                        }}
                      >
                        <div
                          style={{
                            fontSize:
                              "40px",
                          }}
                        >
                          🪑
                        </div>

                        <h3>
                          Mesa {mesa.id}
                        </h3>

                        <p
                          style={{
                            fontWeight:
                              "bold",

                            color:
                              mesa.estado ===
                              "Libre"
                                ? "#16a34a"
                                : "#dc2626",
                          }}
                        >
                          {mesa.estado}
                        </p>

                        {mesa.estado ===
                          "Ocupada" && (
                          <p>
                            Total:{" "}
                            <strong>
                              $
                              {mesa.total.toLocaleString(
                                "es-CO"
                              )}
                            </strong>
                          </p>
                        )}

                        {mesa.estado ===
                        "Libre" ? (
                          <button
                            onClick={() =>
                              abrirMesa(
                                mesa.id
                              )
                            }
                            style={{
                              width:
                                "100%",

                              background:
                                "#16a34a",

                              color:
                                "white",

                              border:
                                "none",

                              padding:
                                "12px",

                              borderRadius:
                                "6px",

                              cursor:
                                "pointer",

                              fontWeight:
                                "bold",
                            }}
                          >
                            Abrir mesa
                          </button>
                        ) : (
                          <div>
                            <button
                              onClick={() =>
                                seleccionarMesa(
                                  mesa.id
                                )
                              }
                              style={{
                                width:
                                  "100%",

                                background:
                                  "#f59e0b",

                                color:
                                  "white",

                                border:
                                  "none",

                                padding:
                                  "12px",

                                borderRadius:
                                  "6px",

                                cursor:
                                  "pointer",

                                fontWeight:
                                  "bold",

                                marginBottom:
                                  "8px",
                              }}
                            >
                              Gestionar mesa
                            </button>

                            <button
                              onClick={() =>
                                cerrarMesa(
                                  mesa.id
                                )
                              }
                              style={{
                                width:
                                  "100%",

                                background:
                                  "#ef4444",

                                color:
                                  "white",

                                border:
                                  "none",

                                padding:
                                  "12px",

                                borderRadius:
                                  "6px",

                                cursor:
                                  "pointer",

                                fontWeight:
                                  "bold",
                              }}
                            >
                              Cerrar cuenta
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </>
            )}

          {/* DETALLE DE MESA */}

          {seccion === "Mesas" &&
            mesaSeleccionada &&
            mesaActual && (
              <div>
                <button
                  onClick={() =>
                    setMesaSeleccionada(null)
                  }
                  style={{
                    background: "#64748b",
                    color: "white",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    marginBottom: "20px",
                  }}
                >
                  ← Volver a las mesas
                </button>

                <h2>
                  🪑 Mesa{" "}
                  {mesaActual.id}
                </h2>

                <p
                  style={{
                    color: "#6b7280",
                  }}
                >
                  Agrega productos a la
                  cuenta.
                </p>

                <div
                  style={{
                    display: "grid",

                    gridTemplateColumns:
                      "minmax(250px, 1fr) minmax(350px, 1.5fr)",

                    gap: "25px",

                    marginTop: "25px",
                  }}
                >
                  {/* PRODUCTOS */}

                  <div
                    style={{
                      background:
                        "white",

                      padding:
                        "20px",

                      borderRadius:
                        "12px",

                      boxShadow:
                        "0 2px 10px rgba(0,0,0,0.08)",
                    }}
                  >
                    <h3>
                      🍺 Productos
                    </h3>

                    {productos.map(
                      (producto) => (
                        <div
                          key={
                            producto.id
                          }
                          style={{
                            display:
                              "flex",

                            justifyContent:
                              "space-between",

                            alignItems:
                              "center",

                            padding:
                              "12px 0",

                            borderBottom:
                              "1px solid #e5e7eb",
                          }}
                        >
                          <div>
                            <strong>
                              {
                                producto.nombre
                              }
                            </strong>

                            <br />

                            <span
                              style={{
                                color:
                                  "#6b7280",
                                fontSize:
                                  "14px",
                              }}
                            >
                              $
                              {producto.precio.toLocaleString(
                                "es-CO"
                              )}
                            </span>
                          </div>

                          <button
                            onClick={() =>
                              agregarProducto(
                                producto
                              )
                            }
                            style={{
                              background:
                                "#16a34a",

                              color:
                                "white",

                              border:
                                "none",

                              padding:
                                "8px 12px",

                              borderRadius:
                                "6px",

                              cursor:
                                "pointer",

                              fontWeight:
                                "bold",
                            }}
                          >
                            + Agregar
                          </button>
                        </div>
                      )
                    )}
                  </div>

                  {/* CUENTA */}

                  <div
                    style={{
                      background:
                        "white",

                      padding:
                        "20px",

                      borderRadius:
                        "12px",

                      boxShadow:
                        "0 2px 10px rgba(0,0,0,0.08)",
                    }}
                  >
                    <h3>
                      🧾 Cuenta de la Mesa
                    </h3>

                    {mesaActual.productos
                      .length === 0 ? (
                      <p
                        style={{
                          color:
                            "#6b7280",
                        }}
                      >
                        No hay productos
                        agregados.
                      </p>
                    ) : (
                      mesaActual.productos.map(
                        (item) => (
                          <div
                            key={
                              item.productoId
                            }
                            style={{
                              padding:
                                "15px 0",

                              borderBottom:
                                "1px solid #e5e7eb",
                            }}
                          >
                            <div
                              style={{
                                display:
                                  "flex",

                                justifyContent:
                                  "space-between",

                                alignItems:
                                  "center",
                              }}
                            >
                              <div>
                                <strong>
                                  {
                                    item.nombre
                                  }
                                </strong>

                                <br />

                                <span
                                  style={{
                                    color:
                                      "#6b7280",
                                    fontSize:
                                      "14px",
                                  }}
                                >
                                  $
                                  {item.precio.toLocaleString(
                                    "es-CO"
                                  )}{" "}
                                  c/u
                                </span>
                              </div>

                              <strong>
                                $
                                {(
                                  item.precio *
                                  item.cantidad
                                ).toLocaleString(
                                  "es-CO"
                                )}
                              </strong>
                            </div>

                            <div
                              style={{
                                marginTop:
                                  "10px",

                                display:
                                  "flex",

                                alignItems:
                                  "center",

                                gap:
                                  "10px",
                              }}
                            >
                              <button
                                onClick={() =>
                                  disminuirCantidad(
                                    item.productoId
                                  )
                                }
                                style={{
                                  background:
                                    "#ef4444",

                                  color:
                                    "white",

                                  border:
                                    "none",

                                  width:
                                    "32px",

                                  height:
                                    "32px",

                                  borderRadius:
                                    "5px",

                                  cursor:
                                    "pointer",

                                  fontSize:
                                    "18px",
                                }}
                              >
                                −
                              </button>

                              <strong>
                                {
                                  item.cantidad
                                }
                              </strong>

                              <button
                                onClick={() =>
                                  aumentarCantidad(
                                    item.productoId
                                  )
                                }
                                style={{
                                  background:
                                    "#16a34a",

                                  color:
                                    "white",

                                  border:
                                    "none",

                                  width:
                                    "32px",

                                  height:
                                    "32px",

                                  borderRadius:
                                    "5px",

                                  cursor:
                                    "pointer",

                                  fontSize:
                                    "18px",
                                }}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )
                      )
                    )}

                    <div
                      style={{
                        marginTop:
                          "25px",

                        paddingTop:
                          "20px",

                        borderTop:
                          "2px solid #e5e7eb",

                        display:
                          "flex",

                        justifyContent:
                          "space-between",

                        alignItems:
                          "center",
                      }}
                    >
                      <h2>
                        Total
                      </h2>

                      <h2
                        style={{
                          color:
                            "#16a34a",
                        }}
                      >
                        $
                        {mesaActual.total.toLocaleString(
                          "es-CO"
                        )}
                      </h2>
                    </div>

                    <button
                      onClick={() =>
                        cerrarMesa(
                          mesaActual.id
                        )
                      }
                      style={{
                        width: "100%",

                        marginTop:
                          "15px",

                        background:
                          "#ef4444",

                        color:
                          "white",

                        border:
                          "none",

                        padding:
                          "14px",

                        borderRadius:
                          "6px",

                        cursor:
                          "pointer",

                        fontWeight:
                          "bold",

                        fontSize:
                          "16px",
                      }}
                    >
                      🧾 Cerrar cuenta
                    </button>
                  </div>
                </div>
              </div>
            )}

          {/* VENTAS */}

          {seccion === "Ventas" && (
            <div
              style={{
                background: "white",
                padding: "30px",
                borderRadius: "12px",
                boxShadow:
                  "0 2px 10px rgba(0,0,0,0.08)",
              }}
            >
              <h2>
                💰 Ventas
              </h2>

              {ventas.length === 0 ? (
                <p
                  style={{
                    color:
                      "#6b7280",
                  }}
                >
                  Todavía no hay ventas
                  registradas.
                </p>
              ) : (
                <div>
                  {ventas.map(
                    (venta) => (
                      <div
                        key={venta.id}
                        style={{
                          display:
                            "flex",

                          justifyContent:
                            "space-between",

                          padding:
                            "15px",

                          borderBottom:
                            "1px solid #e5e7eb",
                        }}
                      >
                        <span>
                          🪑 Mesa{" "}
                          {venta.mesa}
                        </span>

                        <strong>
                          $
                          {venta.total.toLocaleString(
                            "es-CO"
                          )}
                        </strong>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}

          {/* OTRAS SECCIONES */}

          {[
            "Inventario",
            "Reportes",
            "Usuarios",
          ].includes(seccion) && (
            <div
              style={{
                background: "white",

                padding: "30px",

                borderRadius: "12px",

                boxShadow:
                  "0 2px 10px rgba(0,0,0,0.08)",
              }}
            >
              <h2>
                {iconos[seccion]}{" "}
                {seccion}
              </h2>

              <p
                style={{
                  color: "#6b7280",
                }}
              >
                Este módulo será
                desarrollado próximamente.
              </p>
            </div>
          )}
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
      <div
        style={{
          fontSize: "30px",
        }}
      >
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
        }}
      >
        {valor}
      </h2>
    </div>
  );
}