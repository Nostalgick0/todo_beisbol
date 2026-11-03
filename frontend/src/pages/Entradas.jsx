import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { BACKEND_URL } from '../Backend.jsx'
import Pantalla from '../components/Pantalla.jsx'
import Chips from '../components/Chips.jsx'
import CamposEntrada, { cambiarCampoEntrada, entradaValida, datosEntrada } from '../components/CamposEntrada.jsx'
import { Modal, Confirmar } from '../components/Modal.jsx'
import { Campo, Lectura } from '../components/Campo.jsx'
import { Info, Search, Plus, Pencil, PackagePlus } from '../components/Icons.jsx'
import { MESES, moneda, fechaCorta, fechaNumerica, descVariante, mensajeError } from '../data/formato.js'

const ESTADOS = [{ id: 1, nombre: 'Activas' }, { id: 0, nombre: 'Inactivas' }]

export default function Entradas() {
  const navigate = useNavigate()
  const [entradas, setEntradas] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [productos, setProductos] = useState([])
  const [variantes, setVariantes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [proveedor, setProveedor] = useState(null)
  const [estatus, setEstatus] = useState(null)
  const [modal, setModal] = useState(null) // { tipo: 'ver' | 'editar' | 'Desactivar', item }
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')

  const cargar = () =>
    Promise.all([
      axios.get(`${BACKEND_URL}/obtenerEntradas`),
      axios.get(`${BACKEND_URL}/obtenerProveedores`),
      axios.get(`${BACKEND_URL}/obtenerProductos`),
      axios.get(`${BACKEND_URL}/obtenerVariantes`),
    ])
      .then(([e, pv, p, v]) => {
        setEntradas(e.data)
        setProveedores(pv.data)
        setProductos(p.data)
        setVariantes(v.data)
      })
      .catch(() => setError('No se pudo cargar la información'))

  useEffect(() => { cargar() }, [])

  const abrir = (tipo, item = null) => {
    setError('')
    if (tipo === 'editar') {
      setForm({
        fk_proveedor: String(item.fk_proveedor),
        fecha: item.fecha,
        fk_producto: String(item.fk_producto),
        fk_variante: String(item.fk_variante),
        cantidad: String(item.cantidad),
        costo_unidad: String(Number(item.costo_unidad)),
        estatus: String(item.estatus),
      })
    }
    setModal({ tipo, item })
  }

  const set = (campo, valor) => setForm((actual) => cambiarCampoEntrada(actual, campo, valor))

  const guardar = async () => {
    if (!entradaValida(form)) return setError('Completa los campos obligatorios')
    try {
      await axios.post(`${BACKEND_URL}/actualizarEntrada`, { pk_entrada: modal.item.pk_entrada, ...datosEntrada(form), estatus: Number(form.estatus) })
      setModal(null)
      cargar()
    } catch (e) {
      setError(mensajeError(e, 'No se pudo guardar la entrada'))
    }
  }

  const cambiarEstado = async (item, nuevo) => {
    try {
      await axios.post(`${BACKEND_URL}/cambiarEstadoEntrada`, { pk_entrada: item.pk_entrada, estatus: nuevo })
      setModal(null)
      cargar()
    } catch (e) {
      // El cuadro de confirmación se cierra para que el error se vea en la lista
      setModal(null)
      setError(mensajeError(e, 'No se pudo actualizar la entrada'))
    }
  }

  const visibles = entradas.filter((e) =>
    (proveedor === null || e.fk_proveedor === proveedor) &&
    (estatus === null || e.estatus === estatus) &&
    `${e.nom_prod} ${e.marca} ${e.nombre_proveedor}`.toLowerCase().includes(busqueda.toLowerCase())
  )

  // Piezas que han entrado en el mes actual (solo entradas activas)
  const hoy = new Date()
  const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
  const piezasMes = entradas
    .filter((e) => e.estatus === 1 && e.fecha.startsWith(mesActual))
    .reduce((total, e) => total + e.cantidad, 0)

  const item = modal?.item

  return (
    <Pantalla
      titulo="Entradas"
      accion={
        <button className="btn-agregar" onClick={() => navigate('/entradas/nueva')} aria-label="Agregar entrada">
          <Plus size={20} /><span>Agregar entrada</span>
        </button>
      }
    >
      <main className="contenido">
        <div className="alerta">
          <Info />{piezasMes} {piezasMes === 1 ? 'pieza ingresada' : 'piezas ingresadas'} en {MESES[hoy.getMonth()]}
        </div>

        <label className="buscador">
          <Search />
          <input placeholder="Buscar producto, marca o proveedor" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </label>

        <p className="etiqueta-seccion">PROVEEDOR Y ESTATUS</p>
        <div className="filtros">
          <Chips
            todos="Todos"
            opciones={proveedores.filter((p) => p.estatus === 1).map((p) => ({ id: p.pk_proveedor, nombre: p.nombre_proveedor }))}
            valor={proveedor}
            onChange={setProveedor}
          />
          <Chips opciones={ESTADOS} valor={estatus} onChange={setEstatus} />
        </div>

        {error && !modal && <p className="error">{error}</p>}

        <section className="lista">
          <div className="resumen">
            <strong>{visibles.length} {visibles.length === 1 ? 'entrada' : 'entradas'}</strong>
            <span>Total de la entrada</span>
          </div>
          {visibles.map((e) => (
            <article key={e.pk_entrada} className={`tarjeta ${e.estatus === 0 ? 'inactiva' : ''}`} onClick={() => abrir('ver', e)}>
              <div className="tarjeta-top">
                <div className="tarjeta-datos">
                  <h3>{e.nom_prod}</h3>
                  <p>{descVariante(e.marca, e.talla, e.color)}</p>
                </div>
                <span className="insignia azul">+{e.cantidad} {e.cantidad === 1 ? 'pieza' : 'piezas'}</span>
              </div>
              <div className="tarjeta-pie">
                <span>{fechaCorta(e.fecha)} · {e.nombre_proveedor}</span>
                <strong>{moneda(e.total)}</strong>
              </div>
            </article>
          ))}
          {!visibles.length && !error && <p className="vacio">No hay entradas</p>}
        </section>
      </main>

      <button className="fab solo-movil" aria-label="Agregar entrada" onClick={() => navigate('/entradas/nueva')}><Plus /></button>

      {modal?.tipo === 'ver' && (
        <Modal titulo="Ver entrada" icono={<span className="icono-azul"><PackagePlus size={24} /></span>} onCerrar={() => setModal(null)}>
          <div className="formulario modal-form">
            <Campo label="Proveedor"><Lectura valor={item.nombre_proveedor} /></Campo>
            <div className="fila">
              <Campo label="Fecha de compra"><Lectura valor={fechaNumerica(item.fecha)} /></Campo>
              <Campo label="Estatus"><Lectura valor={item.estatus === 1 ? 'Activa' : 'Inactiva'} /></Campo>
            </div>
            <Campo label="Producto"><Lectura valor={item.nom_prod} /></Campo>
            <Campo label="Variante"><Lectura valor={descVariante(item.marca, item.talla, item.color)} /></Campo>
            <div className="fila">
              <Campo label="Cantidad (piezas)"><Lectura valor={item.cantidad} /></Campo>
              <Campo label="Costo unitario"><Lectura valor={moneda(item.costo_unidad)} /></Campo>
            </div>
            <span className="total-badge">Total de la entrada: {moneda(item.total)}</span>
          </div>
          {error && <p className="error">{error}</p>}
          <div className="modal-acciones">
            <button className="btn-borde azul" onClick={() => abrir('editar', item)}><Pencil />Editar</button>
            {item.estatus === 1
              ? <button className="btn-borde rojo" onClick={() => setModal({ tipo: 'Desactivar', item })}>Desactivar</button>
              : <button className="btn-borde azul" onClick={() => cambiarEstado(item, 1)}>Activar</button>}
          </div>
        </Modal>
      )}

      {modal?.tipo === 'editar' && (
        <Modal titulo="Editar entrada" icono={<span className="icono-azul"><PackagePlus size={24} /></span>} onCerrar={() => setModal(null)}>
          <div className="formulario modal-form">
            <CamposEntrada f={form} set={set} proveedores={proveedores} productos={productos} variantes={variantes} />
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
          titulo="Desactivar entrada"
          texto={`¿Estás seguro que deseas desactivar la entrada de ${item.nom_prod}? Esta acción es irreversible.`}
          onCancelar={() => setModal(null)}
          onConfirmar={() => cambiarEstado(item, 0)}
        >
          <p>Compra: {fechaNumerica(item.fecha)}</p>
          <p>{item.cantidad} {item.cantidad === 1 ? 'pieza' : 'piezas'} · Costo unitario: {moneda(item.costo_unidad)}</p>
          <p className="negrita">Total de la entrada: {moneda(item.total)}</p>
        </Confirmar>
      )}
    </Pantalla>
  )
}
