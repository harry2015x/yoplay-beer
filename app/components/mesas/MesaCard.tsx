"use client";

import { useEffect, useState } from "react";
import { Mesa, cantidadProductos, formatoCOP } from "../../../types/mesas";
import {
  IconoBasura,
  IconoBolsa,
  IconoFlecha,
  IconoGestionar,
  IconoNota,
  IconoReloj,
  IconoSilla,
  IconoTarjeta,
} from "./IconosMesas";

type Props = {
  mesa: Mesa;
  onAbrir: (id: number) => void;
  onGestionar: (id: number) => void;
  onSolicitarCierre: (mesa: Mesa) => void;

  /** true si el usuario autenticado es administrador. */
  esAdministrador: boolean;

  /** Abre la confirmación de eliminación (solo se llama si la mesa está Libre). */
  onSolicitarEliminar: (mesa: Mesa) => void;

  /** true mientras esta mesa en particular se está eliminando en Supabase. */
  eliminando?: boolean;

  /**
   * Nota temporal de la mesa (ej: "El señor de la gorra roja").
   * Vive solo en el frontend (ver hooks/useMesas.ts) — nunca en Supabase.
   * Si está vacía o no definida, no se muestra nada.
   */
  nota?: string;
};

function tiempoAbierta(desde: Date | null): string | null {
  if (!desde) return null;

  const minutos = Math.max(0, Math.floor((Date.now() - desde.getTime()) / 60000));

  if (minutos < 1) return "Recién abierta";
  if (minutos < 60) return `${minutos} min abierta`;

  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return `${horas}h ${resto}min abierta`;
}

// Los estilos de la tarjeta viven en la hoja de estilos de MesasModule.tsx
// (clases .mesa-card*, .mesa-accion*).

export default function MesaCard({
  mesa,
  onAbrir,
  onGestionar,
  onSolicitarCierre,
  esAdministrador,
  onSolicitarEliminar,
  eliminando = false,
  nota,
}: Props) {
  const [, forzarRefresco] = useState(0);
  const libre = mesa.estado === "Libre";

  // Refresca el texto de "tiempo abierta" cada minuto sin volver a pedir datos.
  useEffect(() => {
    if (libre) return;
    const intervalo = setInterval(() => forzarRefresco((n) => n + 1), 60000);
    return () => clearInterval(intervalo);
  }, [libre]);

  const totalProductos = cantidadProductos(mesa.productos);
  const tiempo = tiempoAbierta(mesa.abiertaDesde);

  return (
    <article className={`mesa-card ${libre ? "mesa-card--libre" : "mesa-card--ocupada"}`}>
      {/* ===================================================
          CABECERA: IDENTIDAD + ESTADO
      =================================================== */}

      <header className="mesa-card__cabecera">
        <div className="mesa-card__identidad">
          <span className="mesa-card__icono">
            <IconoSilla tamano={20} />
          </span>
          <h3 className="mesa-card__titulo">
            <span className="mesa-card__titulo-etiqueta">Mesa</span>{" "}
            <span className="mesa-card__numero">{mesa.numero}</span>
          </h3>
        </div>

        <span className="mesa-card__estado">
          <span className="mesa-card__punto" aria-hidden="true" />
          {libre ? "LIBRE" : "OCUPADA"}
        </span>
      </header>

      {/* ===================================================
          NOTA TEMPORAL (SOLO OCUPADA)
      =================================================== */}

      {!libre && nota && nota.trim() !== "" && (
        <div className="mesa-card__nota">
          <span className="mesa-card__nota-etiqueta">
            <IconoNota tamano={12} />
            NOTA DE LA MESA
          </span>
          <span className="mesa-card__nota-texto">{nota}</span>
        </div>
      )}

      {/* ===================================================
          DATOS DE LA CUENTA (SOLO OCUPADA)
      =================================================== */}

      {!libre && (
        <div className="mesa-card__datos">
          <div className="mesa-card__total">
            <span className="mesa-card__total-etiqueta">Total</span>
            <strong className="mesa-card__total-valor">{formatoCOP(mesa.total)}</strong>
          </div>

          <div className="mesa-card__meta">
            <span className="mesa-card__chip">
              <IconoBolsa tamano={14} />
              {totalProductos} {totalProductos === 1 ? "producto" : "productos"}
            </span>
            {tiempo && (
              <span className="mesa-card__chip mesa-card__chip--tiempo">
                <IconoReloj tamano={14} />
                {tiempo}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ===================================================
          ACCIONES
      =================================================== */}

      {libre ? (
        <div className="mesa-card__acciones">
          <button
            onClick={() => onAbrir(mesa.id)}
            aria-label={`Abrir mesa ${mesa.numero}`}
            className="mesa-btn mesa-accion mesa-accion--abrir"
          >
            Abrir mesa
            <IconoFlecha tamano={18} />
          </button>

          {/* ===================================================
              ELIMINAR MESA (SOLO ADMINISTRADOR, SOLO SI ESTÁ LIBRE)
          =================================================== */}

          {esAdministrador && (
            <button
              onClick={() => onSolicitarEliminar(mesa)}
              disabled={eliminando}
              aria-label={`Eliminar Mesa ${mesa.numero}`}
              className="mesa-btn mesa-accion mesa-accion--eliminar"
            >
              {!eliminando && <IconoBasura tamano={15} />}
              {eliminando ? "Eliminando..." : "Eliminar"}
            </button>
          )}
        </div>
      ) : (
        <div className="mesa-card__acciones mesa-card__acciones--doble">
          <button
            onClick={() => onGestionar(mesa.id)}
            aria-label={`Gestionar mesa ${mesa.numero}`}
            className="mesa-btn mesa-accion mesa-accion--gestionar"
          >
            <IconoGestionar tamano={17} />
            Gestionar mesa
          </button>

          <button
            onClick={() => onSolicitarCierre(mesa)}
            aria-label={`Cerrar cuenta de la mesa ${mesa.numero}`}
            className="mesa-btn mesa-accion mesa-accion--cerrar"
          >
            <IconoTarjeta tamano={17} />
            Cerrar cuenta
          </button>
        </div>
      )}
    </article>
  );
}
