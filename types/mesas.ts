// Tipos y utilidades compartidas por el módulo de Mesas.

export type Producto = {
  id: number;
  nombre: string;
  precio: number;
  categoria?: string | null;
  imagenUrl?: string | null;
};

export type ItemPedido = {
  productoId: number;
  nombre: string;
  precio: number;
  cantidad: number;

  // Imagen del producto desde Supabase Storage
  imagenUrl: string | null;
};

export type EstadoMesa = "Libre" | "Ocupada";

export type Mesa = {
  id: number;
  numero: number;
  estado: EstadoMesa;
  productos: ItemPedido[];
  total: number;
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

export function formatoCOP(valor: number): string {
  return `$${valor.toLocaleString("es-CO")}`;
}

export function totalPedido(productos: ItemPedido[]): number {
  return productos.reduce(
    (total, item) => total + item.precio * item.cantidad,
    0
  );
}

export function cantidadProductos(productos: ItemPedido[]): number {
  return productos.reduce(
    (total, item) => total + item.cantidad,
    0
  );
}