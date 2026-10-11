import { useEffect, useState } from 'react'
import axios from 'axios'
import { BACKEND_URL } from '../Backend.jsx'
import Pantalla from '../components/Pantalla.jsx'
import Chips from '../components/Chips.jsx'
import { Modal, Confirmar } from '../components/Modal.jsx'
import { Campo, Entrada, Select, Lectura } from '../components/Campo.jsx'
import { Search, Plus, Pencil } from '../components/Icons.jsx'

const ESTADOS = [{ id: 1, nombre: 'Activas' }, { id: 0, nombre: 'Inactivas' }]
const ESTATUS = [{ value: '1', label: 'Activo' }, { value: '0', label: 'Inactivo' }]

// Pantalla genérica para categorías y subcategorías (lista + ver / registrar / editar / eliminar)
export default function Catalogo({ titulo, singular, pk, nom, rutas, conCategoria, Icono }) {
  const [items, setItems] = useState([])
  const [categorias, setCategorias] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [estatus, setEstatus] = useState(null)
  const [modal, setModal] = useState(null) // { tipo: 'ver' | 'registrar' | 'editar' | 'eliminar', item }
  const [form, setForm] = useState({ nombre: '', fk: '', estatus: '1' })
  const [error, setError] = useState('')

  const cargar = () => {
    axios.get(`${BACKEND_URL}/${rutas.obtener}`)
      .then(({ data }) => setItems(data))
      .catch(() => setError('No se pudo cargar la información'))
    if (conCategoria) {
      axios.get(`${BACKEND_URL}/obtenerCategorias`)
        .then(({ data }) => setCategorias(data.filter((c) => c.estatus === 1)))
        .catch(() => setError('No se pudo cargar la información'))
    }
  }

  useEffect(() => { cargar() }, [])

  const abrir = (tipo, item = null) => {
    setError('')
    if (tipo === 'registrar') setForm({ nombre: '', fk: '', estatus: '1' })
    if (tipo === 'editar') setForm({ nombre: item[nom], fk: String(item.fk_categoria ?? ''), estatus: String(item.estatus) })
    setModal({ tipo, item })
  }

  const guardar = async () => {
    if (!form.nombre.trim() || (conCategoria && !form.fk)) return setError('Completa los campos obligatorios')
    const datos = { [nom]: form.nombre.trim(), ...(conCategoria && { fk_categoria: Number(form.fk) }) }
    try {
      if (modal.tipo === 'registrar') {
        await axios.post(`${BACKEND_URL}/${rutas.insertar}`, datos)
      } else {
        await axios.post(`${BACKEND_URL}/${rutas.actualizar}`, { [pk]: modal.item[pk], ...datos, estatus: Number(form.estatus) })
      }
      setModal(null)
      cargar()
    } catch {
      setError(`No se pudo guardar la ${singular}`)
    }
  }

  const cambiarEstado = async (item, nuevo) => {
    try {
      await axios.post(`${BACKEND_URL}/${rutas.estado}`, { [pk]: item[pk], estatus: nuevo })
      setModal(null)
      cargar()
    } catch {
      setError(`No se pudo actualizar la ${singular}`)
    }
  }

  const visibles = items.filter((i) =>
    (estatus === null || i.estatus === estatus) &&
    i[nom].toLowerCase().includes(busqueda.toLowerCase())
  )

  const item = modal?.item
  const iconoModal = <span className="icono-azul"><Icono size={24} /></span>

  return (
    <Pantalla
      titulo={titulo}
      subtitulo={`Consulta las ${titulo.toLowerCase()}.`}
      accion={
        <button className="btn-agregar" onClick={() => abrir('registrar')} aria-label={`Agregar ${singular}`}>
          <Plus size={20} /><span>Agregar {singular}</span>
        </button>
      }
    >
      <main className="contenido">
        <label className="buscador">
          <Search />
          <input placeholder="Buscar por nombre" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </label>

        <p className="etiqueta-seccion">Estatus</p>
        <Chips opciones={ESTADOS} valor={estatus} onChange={setEstatus} />

        {error && !modal && <p className="error">{error}</p>}

        <div className="lista">
          {visibles.map((i) => (
            <article key={i[pk]} className={`item-cat ${i.estatus === 0 ? 'inactiva' : ''}`} onClick={() => abrir('ver', i)}>
              <span className="icono-tile"><Icono size={24} /></span>
              <strong>{i[nom]}</strong>
            </article>
          ))}
          {!visibles.length && !error && <p className="vacio">No hay {titulo.toLowerCase()}</p>}
        </div>
      </main>

      <button className="fab solo-movil" aria-label={`Agregar ${singular}`} onClick={() => abrir('registrar')}><Plus /></button>

      {modal?.tipo === 'ver' && (
        <Modal titulo={`Ver ${singular}`} icono={iconoModal} onCerrar={() => setModal(null)}>
          <div className="formulario modal-form">
            <Campo label={`Nombre de la ${singular}`}><Lectura valor={item[nom]} /></Campo>
            {conCategoria && <Campo label="Nombre de la categoría asociada"><Lectura valor={item.nom_categoria} /></Campo>}
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
        <Modal titulo={`${modal.tipo === 'registrar' ? 'Registrar' : 'Editar'} ${singular}`} icono={iconoModal} onCerrar={() => setModal(null)}>
          <div className="formulario modal-form">
            <Campo label={`Nombre de la ${singular}`}>
              <Entrada placeholder={`Escribe el nombre de la ${singular}`} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </Campo>
            {conCategoria && (
              <Campo label="Asociar a una categoría">
                <Select
                  value={form.fk}
                  onChange={(x) => setForm({ ...form, fk: x })}
                  placeholder="Selecciona una categoría"
                  opciones={categorias.map((c) => ({ value: String(c.pk_categoria), label: c.nom_categoria }))}
                />
              </Campo>
            )}
            {modal.tipo === 'editar' && (
              <Campo label="Estatus"><Select value={form.estatus} onChange={(x) => setForm({ ...form, estatus: x })} opciones={ESTATUS} /></Campo>
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
          titulo={`Desactivar ${singular}`}
          texto={`¿Estás seguro que deseas Desactivar la ${singular}?`}
          onCancelar={() => setModal(null)}
          onConfirmar={() => cambiarEstado(item, 0)}
        />
      )}
    </Pantalla>
  )
}
