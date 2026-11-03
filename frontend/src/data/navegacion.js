import { Package, Tag, ListTree } from '../components/Icons.jsx'

export const SECCIONES_INVENTARIO = [
  { ruta: '/productos', texto: 'Productos', Icono: Package },
  { ruta: '/categorias', texto: 'Categorías', Icono: Tag },
  { ruta: '/subcategorias', texto: 'Subcategorías', Icono: ListTree },
]

// Secciones de primer nivel que ya tienen pantalla
export const SECCIONES = [
  { ruta: '/entradas', texto: 'Entradas de Mercancía' },
  { ruta: '/proveedores', texto: 'Proveedores' },
]

// Aparece en el diseño, pero la base de datos aún no tiene tablas para ella
export const OTRAS_SECCIONES = ['Ventas']
