"use client";

import { useMemo, useState } from "react";

import type { UseMesasResult } from "../../../hooks/useMesas";

import { useInventario } from "../../../hooks/useInventario";

import {
  Mesa,
  Producto,
  formatoCOP,
} from "../../../types/mesas";

import MesasResumen from "./MesasResumen";

import MesasFiltros, {
  FiltroMesas,
} from "./MesasFiltros";

import MesaCard from "./MesaCard";

import MesaModal from "./MesaModal";

import ConfirmModal from "./ConfirmModal";

import Notificacion from "./Notificacion";


// ============================================================
// PROPS
// ============================================================

type Props = {

  estado: UseMesasResult;

};


// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function MesasModule({

  estado,

}: Props) {


  // ==========================================================
  // FILTROS
  // ==========================================================

  const [filtro, setFiltro] =
    useState<FiltroMesas>("todas");


  const [busqueda, setBusqueda] =
    useState("");


  // ==========================================================
  // MESA A CONFIRMAR
  // ==========================================================

  const [mesaAConfirmar, setMesaAConfirmar] =
    useState<Mesa | null>(null);


  // ==========================================================
  // INVENTARIO
  // ==========================================================

  const {

    productos: productosInventario,

    cargandoProductos,

  } = useInventario();


  // ==========================================================
  // CONVERTIR PRODUCTOS DEL INVENTARIO
  // AL FORMATO UTILIZADO POR MESAS
  // ==========================================================

  const productos = useMemo<Producto[]>(() => {

    return productosInventario

      .filter((producto) => producto.activo)

      .map((producto) => ({

        id:
          producto.id,


        nombre:
          producto.nombre,


        // En inventario:
        // precioVenta
        //
        // En mesas:
        // precio

        precio:
          producto.precioVenta ?? 0,


        categoria:
          producto.categoria ?? null,


        imagenUrl:
          producto.imagenUrl ?? null,

      }));

  }, [productosInventario]);


  // ==========================================================
  // ESTADO DE MESAS
  // ==========================================================

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


    // ========================================================
    // LIBERAR UNA MESA VACÍA
    // ========================================================

    liberarMesaVacia,


    // ========================================================
    // CERRAR UNA MESA CON PRODUCTOS
    // ========================================================

    cerrarMesa,


  } = estado;


  // ==========================================================
  // FILTRAR MESAS
  // ==========================================================

  const mesasFiltradas = useMemo(() => {

    return mesas.filter((mesa) => {


      // ======================================================
      // FILTRO POR ESTADO
      // ======================================================

      const coincideFiltro =

        filtro === "todas" ||


        (
          filtro === "libres" &&

          mesa.estado === "Libre"
        ) ||


        (
          filtro === "ocupadas" &&

          mesa.estado === "Ocupada"
        );


      // ======================================================
      // FILTRO POR BÚSQUEDA
      // ======================================================

      const coincideBusqueda =

        busqueda.trim() === "" ||


        String(mesa.numero).includes(

          busqueda.trim()

        );


      // ======================================================
      // RESULTADO
      // ======================================================

      return (

        coincideFiltro &&

        coincideBusqueda

      );

    });

  }, [

    mesas,

    filtro,

    busqueda,

  ]);


  // ==========================================================
  // CONFIRMAR ACCIÓN DE LA MESA
  // ==========================================================

  async function confirmarCierre() {


    // Si no hay mesa seleccionada

    if (!mesaAConfirmar) {

      return;

    }


    // ========================================================
    // VERIFICAR SI LA MESA ESTÁ VACÍA
    // ========================================================

    const mesaVacia =

      mesaAConfirmar.productos.length === 0 ||

      mesaAConfirmar.total <= 0;


    let exito = false;


    // ========================================================
    // MESA VACÍA
    //
    // No registra venta.
    //
    // Simplemente vuelve a estado LIBRE.
    // ========================================================

    if (mesaVacia) {


      exito = await liberarMesaVacia(

        mesaAConfirmar.id

      );


    }


    // ========================================================
    // MESA CON PRODUCTOS
    //
    // Registra la venta y cierra la cuenta.
    // ========================================================

    else {


      exito = await cerrarMesa(

        mesaAConfirmar.id

      );


    }


    // ========================================================
    // OPERACIÓN EXITOSA
    // ========================================================

    if (exito) {


      // Cerrar confirmación

      setMesaAConfirmar(null);


      // Cerrar modal de mesa

      cerrarModal();


    }

  }


  // ==========================================================
  // SOLICITAR CIERRE
  // ==========================================================

  function solicitarCierre(

    mesa: Mesa

  ) {


    setMesaAConfirmar(

      mesa

    );


    cerrarModal();


  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div>


      {/* =====================================================
          ESTILOS
      ===================================================== */}

      <style>{`

        .mesa-card {

          transition:

            transform 160ms ease,

            box-shadow 160ms ease;

        }


        .mesa-card:hover {

          transform:

            translateY(-2px);


          box-shadow:

            0 10px 24px

            rgba(0, 0, 0, 0.1);

        }


        .mesa-btn {

          transition:

            filter 120ms ease,

            transform 120ms ease;

        }


        .mesa-btn:hover:not(:disabled) {

          filter:

            brightness(1.07);

        }


        .mesa-btn:active:not(:disabled) {

          transform:

            scale(0.98);

        }


        .mesa-btn:focus-visible,

        .mesas-filtro-btn:focus-visible {

          outline:

            2px solid #2563eb;


          outline-offset:

            2px;

        }


        .mesas-modal-entrada {

          animation:

            mesas-aparecer

            160ms ease;

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

          background:

            linear-gradient(

              90deg,

              #eceff3 25%,

              #f6f7f9 37%,

              #eceff3 63%

            );


          background-size:

            400% 100%;


          animation:

            mesas-shimmer

            1.4s ease infinite;


          border-radius:

            16px;


          height:

            168px;

        }


        @keyframes mesas-shimmer {


          0% {

            background-position:

              100% 50%;

          }


          100% {

            background-position:

              0 50%;

          }

        }

      `}</style>


      {/* =====================================================
          ENCABEZADO
      ===================================================== */}

      <div

        style={{

          marginBottom:

            "18px",

        }}

      >


        <h2

          style={{

            margin:

              0,

          }}

        >

          🪑 Mesas

        </h2>


        <p

          style={{

            margin:

              "4px 0 0",

            color:

              "#6b7280",

          }}

        >

          Gestión y control de mesas

        </p>


      </div>


      {/* =====================================================
          RESUMEN
      ===================================================== */}

      <MesasResumen

        total={resumen.total}

        libres={resumen.libres}

        ocupadas={resumen.ocupadas}

        ventasActivas={resumen.ventasActivas}

      />


      {/* =====================================================
          FILTROS
      ===================================================== */}

      <MesasFiltros

        filtro={filtro}

        onCambiarFiltro={setFiltro}

        busqueda={busqueda}

        onCambiarBusqueda={setBusqueda}

      />


      {/* =====================================================
          ERROR
      ===================================================== */}

      {errorMesas && (

        <div

          role="alert"

          style={{

            background:

              "#fef2f2",

            border:

              "1px solid #fecaca",

            color:

              "#991b1b",

            borderRadius:

              "10px",

            padding:

              "16px",

            marginBottom:

              "20px",

            display:

              "flex",

            justifyContent:

              "space-between",

            alignItems:

              "center",

            gap:

              "12px",

          }}

        >


          <span>

            {errorMesas}

          </span>


          <button

            onClick={cargarMesas}

            className="mesa-btn"

            style={{

              background:

                "#991b1b",

              color:

                "white",

              border:

                "none",

              padding:

                "8px 14px",

              borderRadius:

                "8px",

              cursor:

                "pointer",

              fontWeight:

                700,

              whiteSpace:

                "nowrap",

            }}

          >

            Reintentar

          </button>


        </div>

      )}


      {/* =====================================================
          CARGANDO MESAS
      ===================================================== */}

      {cargandoMesas ? (

        <div

          style={{

            display:

              "grid",

            gridTemplateColumns:

              "repeat(auto-fit, minmax(200px, 1fr))",

            gap:

              "20px",

          }}

        >


          {Array.from({

            length:

              8,

          }).map((_, indice) => (

            <div

              key={indice}

              className="mesas-skeleton"

              aria-hidden="true"

            />

          ))}


        </div>


      ) : !errorMesas &&

        mesas.length === 0 ? (


        <div

          style={{

            background:

              "white",

            borderRadius:

              "14px",

            padding:

              "40px",

            textAlign:

              "center",

            color:

              "#6b7280",

            boxShadow:

              "0 2px 10px rgba(0,0,0,0.06)",

          }}

        >

          No hay mesas registradas.

        </div>


      ) : !errorMesas &&

        mesasFiltradas.length === 0 ? (


        <div

          style={{

            background:

              "white",

            borderRadius:

              "14px",

            padding:

              "30px",

            textAlign:

              "center",

            color:

              "#6b7280",

            boxShadow:

              "0 2px 10px rgba(0,0,0,0.06)",

          }}

        >

          Ninguna mesa coincide con el filtro

          o la búsqueda actual.

        </div>


      ) : null}


      {/* =====================================================
          LISTADO DE MESAS
      ===================================================== */}

      {!cargandoMesas &&

        !errorMesas &&

        mesasFiltradas.length > 0 && (

          <div

            style={{

              display:

                "grid",

              gridTemplateColumns:

                "repeat(auto-fit, minmax(200px, 1fr))",

              gap:

                "20px",

            }}

          >


            {mesasFiltradas.map(

              (mesa) => (

                <MesaCard

                  key={mesa.id}

                  mesa={mesa}

                  onAbrir={abrirMesa}

                  onGestionar={seleccionarMesa}

                  onSolicitarCierre={solicitarCierre}

                />

              )

            )}


          </div>

        )}


      {/* =====================================================
          MODAL DE LA MESA
      ===================================================== */}

      {mesaActual && (

        <MesaModal

          mesa={mesaActual}

          productos={productos}

          cargandoProductos={

            cargandoProductos

          }

          onCerrarModal={

            cerrarModal

          }

          onAgregarProducto={

            agregarProducto

          }

          onAumentar={

            aumentarCantidad

          }

          onDisminuir={

            disminuirCantidad

          }

          onEliminar={

            eliminarProducto

          }

          onSolicitarCierre={

            solicitarCierre

          }

        />

      )}


      {/* =====================================================
          CONFIRMACIÓN
      ===================================================== */}

      <ConfirmModal

        abierto={

          mesaAConfirmar !== null

        }


        // ====================================================
        // TÍTULO DINÁMICO
        // ====================================================

        titulo={

          mesaAConfirmar

            ? (

                mesaAConfirmar.productos.length === 0 ||

                mesaAConfirmar.total <= 0

              )

              ? `Liberar mesa — Mesa ${mesaAConfirmar.numero}`

              : `Cerrar cuenta — Mesa ${mesaAConfirmar.numero}`

            : ""

        }


        // ====================================================
        // MENSAJE DINÁMICO
        // ====================================================

        mensaje={

          mesaAConfirmar

            ? (

                mesaAConfirmar.productos.length === 0 ||

                mesaAConfirmar.total <= 0

              )

              ? `Esta mesa no tiene productos registrados.

No se creará ninguna venta.

¿Deseas liberar la Mesa ${mesaAConfirmar.numero}?`

              : `Productos: ${mesaAConfirmar.productos.length}

Total: ${formatoCOP(

                  mesaAConfirmar.total

                )}

¿Deseas confirmar el pago y cerrar esta mesa?`

            : ""

        }


        // ====================================================
        // TEXTO DEL BOTÓN
        // ====================================================

        etiquetaConfirmar={

          mesaAConfirmar &&

          (

            mesaAConfirmar.productos.length === 0 ||

            mesaAConfirmar.total <= 0

          )

            ? "Liberar mesa"

            : "Confirmar pago"

        }


        etiquetaCancelar="Cancelar"


        peligroso={true}


        onConfirmar={

          confirmarCierre

        }


        onCancelar={() =>

          setMesaAConfirmar(null)

        }

      />


      {/* =====================================================
          NOTIFICACIONES
      ===================================================== */}

      {notificacion && (

        <Notificacion

          notificacion={notificacion}

          onCerrar={

            cerrarNotificacion

          }

        />

      )}


    </div>

  );

}