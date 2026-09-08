// ARCHIVO: lib/formato.ts
//
// Si tu proyecto YA tiene una función equivalente para formatear
// moneda (por ejemplo dentro de lib/ o utils/ usada por Mesas/Ventas),
// bórrala de aquí y usa esa en su lugar dentro de los componentes de
// Inventario. Este archivo se entrega por separado justamente para
// que puedas decidir si reusar o mantenerlo como utilidad compartida.

export function formatoCOP(valor: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);
}

export function formatoFechaHora(fechaISO: string): string {
  const fecha = new Date(fechaISO);
  const fechaFormateada = new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(fecha);
  const horaFormateada = new Intl.DateTimeFormat("es-CO", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(fecha);
  return `${fechaFormateada} · ${horaFormateada}`;
}
