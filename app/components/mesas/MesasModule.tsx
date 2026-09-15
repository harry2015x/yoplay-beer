"use client";

import { useMemo, useState } from "react";

import type { UseMesasResult } from "../../../hooks/useMesas";

import { useInventario } from "../../../hooks/useInventario";

import {
  Mesa,
  Producto,
} from "../../../types/mesas";

import type { MetodoPagoVenta } from "../../../types/ventas";

import MesasResumen from "./MesasResumen";

import MesasFiltros, {
  FiltroMesas,
} from "./MesasFiltros";

import MesaCard from "./MesaCard";

import MesaModal from "./MesaModal";

import ConfirmModal from "./ConfirmModal";

import CerrarCuentaModal from "./CerrarCuentaModal";

import Notificacion from "./Notificacion";


// ============================================================
// PROPS
// ============================================================

type Props = {

  estado: UseMesasResult;

  /**
   * true si el usuario autenticado tiene rol "administrador"
   * (ver hooks/useAuth.ts -> perfil.rol). Controla la visibilidad
   * de "Nueva mesa" y "Eliminar mesa".
   */
  esAdministrador: boolean;

};


// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function MesasModule({

  estado,

  esAdministrador,

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
  // MESA A ELIMINAR (solo administrador)
  // ==========================================================

  const [mesaAEliminar, setMesaAEliminar] =
    useState<Mesa | null>(null);


  // ==========================================================
  // PROCESANDO PAGO (evita doble clic en "Confirmar pago")
  // ==========================================================

  const [procesandoPago, setProcesandoPago] =
    useState(false);


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

    liberarMesa,


    // ========================================================
    // CERRAR UNA MESA CON PRODUCTOS
    // ========================================================

    cerrarMesa,


    // ========================================================
    // CREAR / ELIMINAR MESA (solo administrador)
    // ========================================================

    crearMesa,

    eliminarMesa,

    creandoMesa,

    eliminandoMesaId,


    // ========================================================
    // NOTA TEMPORAL DE LA MESA (SOLO FRONTEND, NO SUPABASE)
    // ========================================================

    notasMesas,

    establecerNotaMesa,


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
  // ¿LA MESA A CONFIRMAR ESTÁ VACÍA?
  //
  // Vacía = sin productos o total <= 0. Se usa para decidir si
  // se muestra la confirmación de "liberar mesa" (sin venta) o
  // el nuevo modal de cierre de cuenta con método de pago.
  // ==========================================================

  function mesaEstaVacia(mesa: Mesa) {

    return (

      mesa.productos.length === 0 ||

      mesa.total <= 0

    );

  }


  const mesaAConfirmarVacia =

    mesaAConfirmar

      ? mesaEstaVacia(mesaAConfirmar)

      : false;


  // ==========================================================
  // CONFIRMAR LIBERACIÓN DE MESA VACÍA
  //
  // No registra venta. Simplemente vuelve a estado LIBRE.
  // ========================================================== 

  async function confirmarLiberacion() {

    if (!mesaAConfirmar) {

      return;

    }

    const exito = await liberarMesa(

      mesaAConfirmar.id

    );

    if (exito) {

      setMesaAConfirmar(null);

      cerrarModal();

    }

  }


  // ==========================================================
  // CONFIRMAR PAGO (MESA CON PRODUCTOS)
  //
  // El método de pago y el dinero recibido se validan y calculan
  // dentro de CerrarCuentaModal (estado local, no persistido). El
  // valor de la venta SIEMPRE es mesa.total (el total real de los
  // productos) — el dinero recibido nunca lo modifica.
  // ==========================================================

  async function confirmarPago(pago: {

    metodoPago: MetodoPagoVenta;

    montoEfectivo: number;

    montoTransferencia: number;

  }) {

    if (!mesaAConfirmar || procesandoPago) {

      return;

    }

    setProcesandoPago(true);

    const exito = await cerrarMesa(

      mesaAConfirmar.id,

      pago.metodoPago,

      pago.montoEfectivo,

      pago.montoTransferencia

    );

    setProcesandoPago(false);

    if (exito) {

      setMesaAConfirmar(null);

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
  // CREAR NUEVA MESA (solo administrador)
  // ==========================================================

  async function crearNuevaMesa() {

    if (!esAdministrador || creandoMesa) {

      return;

    }

    await crearMesa();

  }


  // ==========================================================
  // SOLICITAR ELIMINACIÓN DE UNA MESA (solo administrador)
  // ==========================================================

  function solicitarEliminacion(

    mesa: Mesa

  ) {

    if (!esAdministrador) {

      return;

    }

    setMesaAEliminar(mesa);

  }


  // ==========================================================
  // CONFIRMAR ELIMINACIÓN
  // ==========================================================

  async function confirmarEliminacion() {

    if (!mesaAEliminar) {

      return;

    }

    const exito = await eliminarMesa(

      mesaAEliminar.id

    );

    if (exito) {

      setMesaAEliminar(null);

    }

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


        @media (max-width: 640px) {

          .mesas-encabezado {

            flex-direction: column;

            align-items: stretch;

          }

          .mesas-btn-nueva {

            width: 100%;

          }

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

        className="mesas-encabezado"

        style={{

          marginBottom:

            "18px",

          display:

            "flex",

          flexWrap:

            "wrap",

          justifyContent:

            "space-between",

          alignItems:

            "center",

          gap:

            "12px",

        }}

      >


        <div>

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
            NUEVA MESA (SOLO ADMINISTRADOR)
        ===================================================== */}

        {esAdministrador && (

          <button

            onClick={crearNuevaMesa}

            disabled={creandoMesa}

            aria-label="Crear nueva mesa"

            className="mesa-btn mesas-btn-nueva"

            style={{

              background:

                "#f59e0b",

              color:

                "white",

              border:

                "none",

              borderRadius:

                "10px",

              padding:

                "12px 18px",

              fontWeight:

                700,

              cursor:

                creandoMesa

                  ? "default"

                  : "pointer",

              opacity:

                creandoMesa

                  ? 0.7

                  : 1,

              minHeight:

                "44px",

              whiteSpace:

                "nowrap",

            }}

          >

            {creandoMesa

              ? "Creando mesa..."

              : "➕ Nueva mesa"}

          </button>

        )}


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

                  esAdministrador={esAdministrador}

                  onSolicitarEliminar={solicitarEliminacion}

                  eliminando={

                    eliminandoMesaId === mesa.id

                  }

                  nota={notasMesas[mesa.id]}

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

          nota={

            notasMesas[mesaActual.id] ?? ""

          }

          onCambiarNota={(texto) =>

            establecerNotaMesa(mesaActual.id, texto)

          }

        />

      )}


      {/* =====================================================
          CIERRE DE CUENTA — MÉTODO DE PAGO (MESA CON PRODUCTOS)
      ===================================================== */}

      {mesaAConfirmar && !mesaAConfirmarVacia && (

        <CerrarCuentaModal

          key={mesaAConfirmar.id}

          mesa={mesaAConfirmar}

          procesando={procesandoPago}

          onConfirmar={confirmarPago}

          onCancelar={() =>

            !procesandoPago && setMesaAConfirmar(null)

          }

        />

      )}


      {/* =====================================================
          CONFIRMACIÓN
      ===================================================== */}

      <ConfirmModal

        abierto={

          mesaAConfirmar !== null &&

          mesaAConfirmarVacia

        }


        titulo={

          mesaAConfirmar

            ? `Liberar mesa — Mesa ${mesaAConfirmar.numero}`

            : ""

        }


        mensaje={

          mesaAConfirmar

            ? `Esta mesa no tiene productos registrados.

No se creará ninguna venta.

¿Deseas liberar la Mesa ${mesaAConfirmar.numero}?`

            : ""

        }


        etiquetaConfirmar="Liberar mesa"


        etiquetaCancelar="Cancelar"


        peligroso={true}


        onConfirmar={

          confirmarLiberacion

        }


        onCancelar={() =>

          setMesaAConfirmar(null)

        }

      />


      {/* =====================================================
          CONFIRMACIÓN DE ELIMINACIÓN (SOLO ADMINISTRADOR)
      ===================================================== */}

      <ConfirmModal

        abierto={

          esAdministrador &&

          mesaAEliminar !== null

        }

        titulo="Eliminar mesa"

        mensaje={

          mesaAEliminar

            ? `¿Deseas eliminar la Mesa ${mesaAEliminar.numero}?\n\nEsta acción no se puede deshacer.`

            : ""

        }

        etiquetaConfirmar={

          mesaAEliminar &&

          eliminandoMesaId ===

            mesaAEliminar.id

            ? "Eliminando..."

            : "🗑️ Eliminar"

        }

        etiquetaCancelar="Cancelar"

        peligroso={true}

        onConfirmar={

          confirmarEliminacion

        }

        onCancelar={() =>

          setMesaAEliminar(null)

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