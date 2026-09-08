"use client";

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

export default function MesasFiltros({ filtro, onCambiarFiltro, busqueda, onCambiarBusqueda }: Props) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "12px",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
      }}
    >
      <div role="tablist" aria-label="Filtrar mesas" style={{ display: "flex", gap: "8px" }}>
        {OPCIONES.map((opcion) => (
          <button
            key={opcion.valor}
            role="tab"
            aria-selected={filtro === opcion.valor}
            onClick={() => onCambiarFiltro(opcion.valor)}
            className="mesas-filtro-btn"
            style={{
              padding: "9px 18px",
              borderRadius: "999px",
              border: filtro === opcion.valor ? "1px solid #172131" : "1px solid #d1d5db",
              background: filtro === opcion.valor ? "#172131" : "white",
              color: filtro === opcion.valor ? "white" : "#374151",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            {opcion.etiqueta}
          </button>
        ))}
      </div>

      <input
        type="search"
        value={busqueda}
        onChange={(evento) => onCambiarBusqueda(evento.target.value)}
        placeholder="Buscar mesa por nÃºmero..."
        aria-label="Buscar mesa"
        style={{
          padding: "10px 14px",
          borderRadius: "10px",
          border: "1px solid #d1d5db",
          minWidth: "220px",
          fontSize: "14px",
        }}
      />
    </div>
  );
}




