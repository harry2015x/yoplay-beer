# Módulo Mesas — YO PLAY BEER

## 1. Archivos entregados

```
app/page.tsx                        (reemplaza tu archivo actual)
hooks/useMesas.ts                   (nuevo)
types/mesas.ts                      (nuevo)
lib/supabase.ts                     (igual al que ya usas — solo revisa que coincida)
components/mesas/MesasModule.tsx    (nuevo)
components/mesas/MesasResumen.tsx   (nuevo)
components/mesas/MesasFiltros.tsx   (nuevo)
components/mesas/MesaCard.tsx       (nuevo)
components/mesas/MesaModal.tsx      (nuevo)
components/mesas/PedidoActual.tsx   (nuevo)
components/mesas/ConfirmModal.tsx   (nuevo)
components/mesas/Notificacion.tsx   (nuevo)
```

Copia cada archivo a la misma ruta relativa dentro de tu proyecto (todos parten de la raíz, junto a tu carpeta `app/`).

## 2. Errores corregidos

- **`abrirMesa` no persistía en Supabase** — solo hacía `setMesas` local; ahora hace `update` a la tabla `mesas` y solo actualiza la UI si la respuesta es exitosa.
- **`id` de mesa confundido con `numero`** — el código original guardaba `id: mesa.numero`, perdiendo el id real de la fila. Ahora `Mesa.id` es el id real (se usa para `update`/`insert`) y `Mesa.numero` es el número visible (se usa para ordenar y mostrar).
- **Comparación `estado` sensible a mayúsculas** — se normaliza con `.toLowerCase()` antes de comparar contra `"ocupada"`.
- **Un solo `cargarMesas`, un solo `useEffect`, un solo `useState` de mesas/ventas** — todo vive ahora en `hooks/useMesas.ts` y se usa una sola vez en `app/page.tsx`; `Inicio`, `Mesas` y `Ventas` leen del mismo estado, sin duplicarlo.
- **`cerrarMesa` no tenía estado de carga/():** se agregó manejo de error para el `update` de liberar la mesa (antes solo se controlaba el `insert` de la venta).
- **`venta.mesa` renombrado a `venta.mesaNumero`** para que quede claro que es el número visible y no el id.

## 3. Funcionalidad nueva del módulo Mesas

- Carga desde Supabase con estado de **carga (skeleton)**, **error con botón "Reintentar"** y **vacío** ("No hay mesas registradas.").
- Encabezado con resumen dinámico: total, libres, ocupadas, ventas activas.
- Filtros **Todas / Libres / Ocupadas** + búsqueda por número de mesa.
- Tarjetas de mesa modernas (grid responsive 4 → 2 → 1 columnas) con badge de estado, total, cantidad de productos y tiempo abierta.
- Panel de gestión en **modal** (no navega de página) con catálogo de productos + pedido actual (sumar, restar, eliminar producto).
- Cierre de cuenta con **modal de confirmación** (reemplaza `window.confirm`) y **notificaciones tipo toast** (reemplazan `alert()`).
- Animaciones sutiles (hover en tarjetas/botones, aparición de modal, shimmer del skeleton) y foco visible para accesibilidad.

## 4. Supuestos sobre Supabase (avísame si alguno no aplica)

No tengo acceso a tu base de datos, así que trabajé con lo que ya usaba tu código:

- Tabla `mesas`: columnas `id` (PK), `numero` (int), `estado` (`"libre"` / `"ocupada"`, en minúscula).
- Tabla `ventas`: se sigue insertando con `mesa_id`, `total`, `estado` (`"cerrada"`), igual que tu código original.
- **El pedido en curso (productos agregados a una mesa) no se persiste en Supabase** — no existe una tabla `detalle_ventas` confirmada, y el brief pide no crearla sin avisar. Por ahora el pedido vive en memoria (se pierde si recargas la página con una mesa abierta). La arquitectura ya está lista para conectar una tabla `detalle_ventas` más adelante: solo habría que guardar `mesa.productos` ahí en `cerrarMesa()` de `hooks/useMesas.ts`.
- El "tiempo abierta" tampoco se persiste (no hay columna para eso); se calcula en el cliente desde el momento en que se abre la mesa y se pierde al recargar. Si agregas una columna tipo `abierta_desde`, se puede leer en `cargarMesas()`.

## 5. Verificación

No tengo el repositorio real (node_modules, next.config, etc.), así que no pude correr `npm run build` directamente sobre tu proyecto. Sí verifiqué **estos archivos exactos** con `tsc --noEmit` estricto en un entorno reconstruido con React + `@supabase/supabase-js`: **0 errores**.

Antes de dar por cerrado el módulo, corre en tu proyecto real:

```
npm run build
```

Si tu `lib/supabase.ts` actual no es idéntico al de este entregable, no lo reemplaces — solo confirma que exporta `supabase` igual que aquí.
