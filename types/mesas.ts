// Tipos y utilidades compartidas por el módulo de Mesas.
// Centralizados aquí para no duplicar tipos entre page.tsx y los
// componentes de components/mesas/*.

export type Producto = {
  id: number;
  nombre: string;
  precio: number;
};

export type ItemPedido = {
  productoId: number;
  nombre: string;
  precio: number;
  cantidad: number;
};

export type EstadoMesa = "Libre" | "Ocupada";

export type Mesa = {
  /** id real de la fila en Supabase (columna "id"), se usa para toda operación contra la BD */
  id: number;
  /** número visible de la mesa (columna "numero") */
  numero: number;
  estado: EstadoMesa;
  productos: ItemPedido[];
  total: number;
  /**
   * Momento en que se abrió la mesa. Se calcula sólo en el cliente porque la
   * tabla "mesas" no tiene una columna para esto todavía; si se agrega
   * (por ejemplo "abierta_desde"), este valor puede empezar a persistirse
   * y a leerse en cargarMesas() en lugar de perderse al recargar la página.
   */
  abiertaDesde: Date | null;
};

export type Venta = {
  id: number;
  mesaId: number;
  mesaNumero: number;
  total: number;
  fecha: Date;
};

export type TipoNotificacion = "success" | "error";

export type Notificacion = {
  tipo: TipoNotificacion;
  mensaje: string;
};

// Catálogo de productos. Se mantiene igual que en la versión anterior:
// por ahora es local al proyecto y no depende de una tabla de inventario,
// tal como pide el punto 12 del brief ("no romper el futuro módulo Inventario").
export const PRODUCTOS: Producto[] = [
  { id: 1, nombre: "Cerveza", precio: 5000 },
  { id: 2, nombre: "Águila", precio: 6000 },
  { id: 3, nombre: "Gaseosa", precio: 5000 },
  { id: 4, nombre: "Agua", precio: 3000 },
  { id: 5, nombre: "Papas", precio: 7000 },
  { id: 6, nombre: "Whisky", precio: 12000 },
];

export function formatoCOP(valor: number): string {
  return `$${valor.toLocaleString("es-CO")}`;
}

export function totalPedido(productos: ItemPedido[]): number {
  return productos.reduce((total, item) => total + item.precio * item.cantidad, 0);
}

export function cantidadProductos(productos: ItemPedido[]): number {
  return productos.reduce((total, item) => total + item.cantidad, 0);
}
