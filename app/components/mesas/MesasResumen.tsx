"use client";

import { IconoCheck, IconoCuadricula, IconoRecibo, IconoReloj } from "./IconosMesas";

type Props = {
  total: number;
  libres: number;
  ocupadas: number;
  ventasActivas: number;
};

// Los estilos viven en la hoja de estilos de MesasModule.tsx (clases .mesas-stat*).

export default function MesasResumen({ total, libres, ocupadas, ventasActivas }: Props) {
  const indicadores = [
    { etiqueta: "Total mesas", valor: total, tono: "tinta", Icono: IconoCuadricula },
    { etiqueta: "Mesas libres", valor: libres, tono: "verde", Icono: IconoCheck },
    { etiqueta: "Mesas ocupadas", valor: ocupadas, tono: "naranja", Icono: IconoReloj },
    { etiqueta: "Ventas activas", valor: ventasActivas, tono: "verde-oscuro", Icono: IconoRecibo },
  ];

  return (
    <div className="mesas-resumen">
      {indicadores.map(({ etiqueta, valor, tono, Icono }) => (
        <div key={etiqueta} className={`mesas-stat mesas-stat--${tono}`}>
          <span className="mesas-stat__icono">
            <Icono tamano={20} />
          </span>
          <div className="mesas-stat__texto">
            <p className="mesas-stat__etiqueta">{etiqueta}</p>
            <p className="mesas-stat__valor">{valor}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
