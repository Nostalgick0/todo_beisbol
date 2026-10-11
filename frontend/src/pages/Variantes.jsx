import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { BACKEND_URL } from '../Backend.jsx'
import Pantalla from '../components/Pantalla.jsx'
import Chips from '../components/Chips.jsx'
import CamposVariante from '../components/CamposVariante.jsx'
import { Modal, Confirmar } from '../components/Modal.jsx'
import { Campo, Select, Lectura } from '../components/Campo.jsx'
import { CircleAlert, Plus, Pencil } from '../components/Icons.jsx'

const VACIA = { estilo: '', talla: '', color: '', tipo_publico: '', tipo_caja: '', precio_venta: '', stock: '', estatus: '1' }
const ESTADOS = [{ id: 1, nombre: 'Activas' }, { id: 0, nombre: 'Inactivas' }]
const ESTATUS = [{ value: '1', label: 'Activo' }, { value: '0', label: 'Inactivo' }]

export default function Variantes() {
  const { id } = useParams()
  const [producto, setProducto] = useState(null)
  const [ruta, setRuta] = useState('')
  const [variantes, setVariantes] = useState([])
  const [estatus, setEstatus] = useState(null)
  const [modal, setModal] = useState(null) // { tipo: 'ver' | 'registrar' | 'editar' | '', item }
  const [form, setForm] = useState(VACIA)
  const [error, setError] = useState('')
  const [cargado, setCargado] = useState(false)

  const cargar = () =>
    Promise.all([
      axios.get(`${BACKEND_URL}/obtenerProductos`),
      axios.get(`${BACKEND_URL}/obtenerCategorias`),
      axios.get(`${BACKEND_URL}/obtenerSubcategorias`),
      axios.get(`${BACKEND_URL}/obtenerVariantes`),
    ])
      .then(([p, c, s, v]) => {
        const prod = p.data.find((x) => x.pk_prod === Number(id))
        setProducto(prod || null)
        const cat = c.data.find((x) => x.pk_categoria === prod?.fk_categoria)
        const sub = s.data.find((x) => x.pk_subcategoria === prod?.fk_subcategoria)
        setRuta([cat?.nom_categoria, sub?.nom_subcategoria].filter(Boolean).join(' / '))
        setVariantes(v.data.filter((x) => x.fk_producto === Number(id)))
      })
      .catch(() => setError('No se pudo cargar la información'))
      .finally(() => setCargado(true))

  useEffect(() => { cargar() }, [id])

  const abrir = (tipo, item = null) => {
    setError('')
    if (tipo === 'registrar') setForm(VACIA)
    if (tipo === 'editar') {
      setForm({
        estilo: item.estilo, talla: item.talla, color: item.color, tipo_publico: item.tipo_publico,
        tipo_caja: item.tipo_caja ?? '', precio_venta: String(item.precio_venta), stock: String(item.stock),
        estatus: String(item.estatus),
      })
    }
    setModal({ tipo, item })
  }

  const set = (campo, valor) => setForm({ ...form, [campo]: valor })

  const guardar = async () => {
    const { estilo, talla, color, tipo_publico, tipo_caja, precio_venta, stock } = form
    if (!estilo || !talla || !color || !tipo_publico || precio_venta === '' || stock === '') {
      return setError('Completa los campos obligatorios')
    }
    const datos = { fk_producto: Number(id), estilo, talla, color, tipo_publico, tipo_caja, precio_venta: Number(precio_venta), stock: Number(stock) }
    try {
      if (modal.tipo === 'registrar') {
        await axios.post(`${BACKEND_URL}/insertarVariante`, datos)
      } else {
        await axios.post(`${BACKEND_URL}/actualizarVariante`, { pk_variante: modal.item.pk_variante, ...datos, estatus: Number(form.estatus) })
      }
      setModal(null)
      cargar()
    } catch {
      setError('No se pudo guardar la variante')
    }
  }

  const cambiarEstado = async (item, nuevo) => {
    try {
      await axios.post(`${BACKEND_URL}/cambiarEstadoVariante`, { pk_variante: item.pk_variante, estatus: nuevo })
      setModal(null)
      cargar()
    } catch {
      setError('No se pudo actualizar la variante')
    }
  }

  const visibles = variantes.filter((v) => estatus === null || v.estatus === estatus)

  if (cargado && !producto) {
    return <Pantalla titulo="Variantes" volver="/productos"><p className="vacio">Producto no encontrado</p></Pantalla>
  }

  const item = modal?.item

  return (
    <Pantalla
      titulo="Variantes"
      volver="/productos"
      accion={
        <button className="btn-agregar" onClick={() => abrir('registrar')} aria-label="Agregar variante">
          <Plus size={20} /><span>Agregar variante</span>
        </button>
      }
      pie={<button className="btn-primario con-icono" onClick={() => abrir('registrar')}><Plus size={20} />Agregar variante</button>}
      pieSoloMovil
    >
      {producto && (
        <main className="contenido">
          <div className="detalle-prod">
            {ruta && <span className="migas">{ruta}</span>}
            <h2 className="titulo-prod">{producto.nom_prod}</h2>
            <span className="total-badge">{producto.existencia} unidades en total</span>
          </div>

          <p className="etiqueta-seccion">Estatus</p>
          <Chips opciones={ESTADOS} valor={estatus} onChange={setEstatus} />

          {error && !modal && <p className="error">{error}</p>}

          <h3 className="seccion-titulo">Variantes <span>· {visibles.length}</span></h3>
          <div className="lista">
            {visibles.map((v) => (
              <article key={v.pk_variante} className={`tarjeta ${v.estatus === 0 ? 'inactiva' : ''}`} onClick={() => abrir('ver', v)}>
                <div className="tarjeta-top">
                  <div className="tarjeta-datos"><h3>{v.estilo}</h3></div>
                  {v.estatus === 1 && !!v.bajo_stock && <span className="insignia"><CircleAlert />Queda {v.stock}</span>}
                </div>
                <div className="atributos">
                  <div><span>Talla</span><b>{v.talla}</b></div>
                  <div><span>Color</span><b>{v.color}</b></div>
                </div>
                <div className="tarjeta-pie">
                  <span>Marca: {producto.marca}</span>
                  <strong>{v.stock} en existencia</strong>
                </div>
              </article>
            ))}
            {!visibles.length && <p className="vacio">No hay variantes</p>}
          </div>
        </main>
      )}

      {modal?.tipo === 'ver' && (
        <Modal titulo="Información de la variante" onCerrar={() => setModal(null)}>
          <div className="formulario modal-form">
            <Campo label="Estilo"><Lectura valor={item.estilo} /></Campo>
            <Campo label="Talla"><Lectura valor={item.talla} /></Campo>
            <Campo label="Color"><Lectura valor={item.color} /></Campo>
            <Campo label="Tipo de público"><Lectura valor={item.tipo_publico} /></Campo>
            <Campo label="Tipo de caja"><Lectura valor={item.tipo_caja || '—'} /></Campo>
            <Campo label="Precio de venta"><Lectura valor={`$${Number(item.precio_venta)}`} /></Campo>
            <Campo label="Stock"><Lectura valor={item.stock} /></Campo>
            <Campo label="Estatus"><Lectura valor={item.estatus === 1 ? 'Activo' : 'Inactivo'} /></Campo>
          </div>
          <div className="modal-acciones">
            <button className="btn-borde azul" onClick={() => abrir('editar', item)}><Pencil />Editar</button>
            {item.estatus === 1
              ? <button className="btn-borde rojo" onClick={() => setModal({ tipo: 'Desactivar', item })}>Desactivar</button>
              : <button className="btn-borde azul" onClick={() => cambiarEstado(item, 1)}>Activar</button>}
          </div>
        </Modal>
      )}

      {(modal?.tipo === 'registrar' || modal?.tipo === 'editar') && (
        <Modal titulo={modal.tipo === 'registrar' ? 'Registrar variante' : 'Editar variante'} onCerrar={() => setModal(null)}>
          <div className="formulario modal-form">
            <CamposVariante v={form} set={set} />
            {modal.tipo === 'editar' && (
              <Campo label="Estatus"><Select value={form.estatus} onChange={(x) => set('estatus', x)} opciones={ESTATUS} /></Campo>
            )}
          </div>
          {error && <p className="error">{error}</p>}
          <div className="modal-acciones">
            <button className="btn-borde azul" onClick={guardar}>Guardar</button>
            <button className="btn-borde gris" onClick={() => setModal(null)}>Cancelar</button>
          </div>
        </Modal>
      )}

      {modal?.tipo === 'Desactivar' && (
        <Confirmar
          titulo="Desactivar variante"
          texto="¿Estás seguro que deseas desactivar la variante?"
          onCancelar={() => setModal(null)}
          onConfirmar={() => cambiarEstado(item, 0)}
        />
      )}
    </Pantalla>
  )
}
