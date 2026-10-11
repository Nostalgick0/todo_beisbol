import { Package, Tag, ListTree } from '../components/Icons.jsx'

export const SECCIONES_INVENTARIO = [
  { ruta: '/productos', texto: 'Productos', Icono: Package },
  { ruta: '/categorias', texto: 'Categorías', Icono: Tag },
  { ruta: '/subcategorias', texto: 'Subcategorías', Icono: ListTree },
]

// Aparecen en el diseño, pero la base de datos aún no tiene tablas para ellas
export const OTRAS_SECCIONES = ['Entradas de Mercancía', 'Proveedores', 'Ventas']
