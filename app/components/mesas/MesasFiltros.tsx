"use client";

import { IconoBuscar } from "./IconosMesas";

export type FiltroMesas = "todas" | "libres" | "ocupadas";

type Props = {
  filtro: FiltroMesas;
  onCambiarFiltro: (filtro: FiltroMesas) => void;
  busqueda: string;
  onCambiarBusqueda: (valor: string) => void;
};

const OPCIONES: { valor: FiltroMesas; etiqueta: string }[] = [
  { valor: "todas", etiqueta: "Todas" },
  { valor: "libres", etiqueta: "Libres" },
  { valor: "ocupadas", etiqueta: "Ocupadas" },
];

// Los estilos viven en la hoja de estilos de MesasModule.tsx (clases .mesas-toolbar*).

export default function MesasFiltros({ filtro, onCambiarFiltro, busqueda, onCambiarBusqueda }: Props) {
  return (
    <div className="mesas-toolbar">
      <div role="tablist" aria-label="Filtrar mesas" className="mesas-segmentos">
        {OPCIONES.map((opcion) => (
          <button
            key={opcion.valor}
            role="tab"
            aria-selected={filtro === opcion.valor}
            onClick={() => onCambiarFiltro(opcion.valor)}
            className={`mesas-filtro-btn mesas-filtro-btn--${opcion.valor}`}
          >
            <span className="mesas-filtro-btn__punto" aria-hidden="true" />
            {opcion.etiqueta}
          </button>
        ))}
      </div>

      <label className="mesas-busqueda">
        <span className="mesas-busqueda__icono">
          <IconoBuscar tamano={17} />
        </span>
        <input
          type="search"
          value={busqueda}
          onChange={(evento) => onCambiarBusqueda(evento.target.value)}
          placeholder="Buscar mesa por número..."
          aria-label="Buscar mesa"
          className="mesas-busqueda__input"
        />
      </label>
    </div>
  );
}
