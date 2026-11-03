import { Campo, Entrada, Select } from './Campo.jsx'
import { moneda } from '../data/formato.js'

const ESTATUS = [{ value: '1', label: 'Activa' }, { value: '0', label: 'Inactiva' }]

export const ENTRADA_VACIA = { fk_proveedor: '', fecha: '', fk_producto: '', fk_variante: '', cantidad: '1', costo_unidad: '', estatus: '1' }

// Al cambiar de producto se limpia la variante (cada variante pertenece a un solo producto)
export const cambiarCampoEntrada = (f, campo, valor) => ({
  ...f,
  [campo]: valor,
  ...(campo === 'fk_producto' && { fk_variante: '' }),
})

export const totalEntrada = (f) => (Number(f.cantidad) || 0) * (Number(f.costo_unidad) || 0)

export const entradaValida = (f) =>
  !!f.fk_proveedor && !!f.fecha && !!f.fk_producto && !!f.fk_variante &&
  Number.isInteger(Number(f.cantidad)) && Number(f.cantidad) >= 1 &&
  f.costo_unidad !== '' && Number(f.costo_unidad) >= 0

// Lo que se manda al backend (el total lo calcula el servidor)
export const datosEntrada = (f) => ({
  fk_proveedor: Number(f.fk_proveedor),
  fecha: f.fecha,
  fk_producto: Number(f.fk_producto),
  fk_variante: Number(f.fk_variante),
  cantidad: Number(f.cantidad),
  costo_unidad: Number(f.costo_unidad),
})

// Campos de la entrada. completo = pantalla de registro (con secciones);
// sin completo = modal de edición (más compacto y con estatus).
// Solo se ofrecen proveedores, productos y variantes activos (más el que ya tenga la entrada, aunque esté inactivo).
export default function CamposEntrada({ f, set, proveedores, productos, variantes, completo }) {
  const opProveedores = proveedores
    .filter((p) => p.estatus === 1 || String(p.pk_proveedor) === f.fk_proveedor)
    .map((p) => ({ value: String(p.pk_proveedor), label: p.nombre_proveedor }))

  const opProductos = productos
    .filter((p) => p.estatus === 1 || String(p.pk_prod) === f.fk_producto)
    .map((p) => ({ value: String(p.pk_prod), label: p.nom_prod }))

  const opVariantes = variantes
    .filter((v) => v.fk_producto === Number(f.fk_producto) && (v.estatus === 1 || String(v.pk_variante) === f.fk_variante))
    .map((v) => ({ value: String(v.pk_variante), label: `${v.estilo} · Talla ${v.talla} · Color ${v.color}` }))

  const proveedor = (
    <Campo label="Proveedor"><Select value={f.fk_proveedor} onChange={(x) => set('fk_proveedor', x)} opciones={opProveedores} /></Campo>
  )
  const fecha = (
    <Campo label="Fecha de compra"><Entrada type="date" value={f.fecha} onChange={(e) => set('fecha', e.target.value)} /></Campo>
  )
  const estatus = (
    <Campo label="Estatus"><Select value={f.estatus} onChange={(x) => set('estatus', x)} opciones={ESTATUS} /></Campo>
  )
  const selProducto = (
    <Campo label="Producto"><Select value={f.fk_producto} onChange={(x) => set('fk_producto', x)} opciones={opProductos} /></Campo>
  )
  const selVariante = (
    <Campo label="Variante"><Select value={f.fk_variante} onChange={(x) => set('fk_variante', x)} opciones={opVariantes} /></Campo>
  )
  const costoYCantidad = (
    <div className="fila">
      <Campo label="Cantidad (piezas)">
        <Entrada type="number" min="1" step="1" placeholder="1" value={f.cantidad} onChange={(e) => set('cantidad', e.target.value)} />
      </Campo>
      <Campo label="Costo unitario">
        <Entrada type="number" min="0" step="0.01" placeholder="$0.00" value={f.costo_unidad} onChange={(e) => set('costo_unidad', e.target.value)} />
      </Campo>
    </div>
  )
  const total = <span className="total-badge">Total de la entrada: {moneda(totalEntrada(f))}</span>

  if (completo) {
    return (
      <>
        <h2>Datos de la entrada</h2>
        {proveedor}
        {fecha}
        <h2>Datos de la mercancía</h2>
        {selProducto}
        {selVariante}
        <h2>Costo y cantidad</h2>
        {costoYCantidad}
        {total}
      </>
    )
  }

  return (
    <>
      {proveedor}
      <div className="fila">{fecha}{estatus}</div>
      {selProducto}
      {selVariante}
      {costoYCantidad}
      {total}
    </>
  )
}