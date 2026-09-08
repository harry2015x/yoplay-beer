"use client";

type Props = {
  total: number;
  libres: number;
  ocupadas: number;
  ventasActivas: number;
};

export default function MesasResumen({ total, libres, ocupadas, ventasActivas }: Props) {
  const indicadores = [
    { etiqueta: "Total mesas", valor: total, color: "#172131", icono: "ðŸª‘" },
    { etiqueta: "Mesas libres", valor: libres, color: "#16a34a", icono: "âœ…" },
    { etiqueta: "Mesas ocupadas", valor: ocupadas, color: "#f59e0b", icono: "ðŸ•’" },
    { etiqueta: "Ventas activas", valor: ventasActivas, color: "#2563eb", icono: "ðŸ’³" },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "16px",
        marginBottom: "24px",
      }}
    >
      {indicadores.map((indicador) => (
        <div
          key={indicador.etiqueta}
          style={{
            background: "white",
            borderRadius: "14px",
            padding: "18px 20px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            borderLeft: `4px solid ${indicador.color}`,
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <span style={{ fontSize: "26px" }} aria-hidden="true">
            {indicador.icono}
          </span>
          <div>
            <p style={{ margin: 0, color: "#6b7280", fontSize: "13px" }}>{indicador.etiqueta}</p>
            <p style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: "#111827" }}>
              {indicador.valor}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}




