import { Campo, Entrada, Combo } from './Campo.jsx'
import { TALLAS, COLORES } from '../data/opciones.js'

// Campos de la variante. Talla y color se pueden elegir de la lista o escribir.
// selects = true es la pantalla completa (tallas y colores lado a lado)
export default function CamposVariante({ v, set, selects }) {
  return (
    <>
      <Campo label="Estilo">
        <Entrada placeholder="Escribe el estilo" value={v.estilo} onChange={(e) => set('estilo', e.target.value)} />
      </Campo>
      <div className={selects ? 'fila' : ''}>
        <Campo label="Talla">
          <Combo value={v.talla} onChange={(x) => set('talla', x)} opciones={TALLAS} placeholder="Elige o escribe" maxLength={20} />
        </Campo>
        <Campo label="Color">
          <Combo value={v.color} onChange={(x) => set('color', x)} opciones={COLORES} placeholder="Elige o escribe" maxLength={20} />
        </Campo>
      </div>
      <Campo label="Tipo de público">
        <Entrada placeholder="Escribe el tipo de público" value={v.tipo_publico} onChange={(e) => set('tipo_publico', e.target.value)} />
      </Campo>
      <Campo label={selects ? 'Tipo de caja (opcional)' : 'Tipo de caja'}>
        <Entrada placeholder="Escribe el tipo de caja" value={v.tipo_caja} onChange={(e) => set('tipo_caja', e.target.value)} />
      </Campo>
      <Campo label="Precio de venta">
        <Entrada type="number" min="0" step="0.01" placeholder="$0.00" value={v.precio_venta} onChange={(e) => set('precio_venta', e.target.value)} />
      </Campo>
      <Campo label={selects ? 'Stock (unidades)' : 'Stock'}>
        <Entrada type="number" min="0" step="1" placeholder="0" value={v.stock} onChange={(e) => set('stock', e.target.value)} />
      </Campo>
    </>
  )
}
