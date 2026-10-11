import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { BACKEND_URL } from '../Backend.jsx'
import Pantalla from '../components/Pantalla.jsx'
import Chips from '../components/Chips.jsx'
import TarjetaProducto from '../components/TarjetaProducto.jsx'
import { Info, Search, Plus } from '../components/Icons.jsx'

export default function Productos() {
  const navigate = useNavigate()
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState(null)
  const [subcategoria, setSubcategoria] = useState(null)
  const [categorias, setCategorias] = useState([])
  const [subcategorias, setSubcategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      axios.get(`${BACKEND_URL}/obtenerCategorias`),
      axios.get(`${BACKEND_URL}/obtenerSubcategorias`),
      axios.get(`${BACKEND_URL}/obtenerProductos`),
    ])
      .then(([c, s, p]) => {
        setCategorias(c.data.filter((x) => x.estatus === 1))
        setSubcategorias(s.data.filter((x) => x.estatus === 1))
        setProductos(p.data.filter((x) => x.estatus === 1))
      })
      .catch(() => setError('No se pudo cargar la información'))
  }, [])

  const cambiarCategoria = (id) => {
    setCategoria(id)
    setSubcategoria(null)
  }

  const subVisibles = subcategorias.filter((s) => categoria === null || s.fk_categoria === categoria)

  const filtrados = productos.filter((p) =>
    (categoria === null || p.fk_categoria === categoria) &&
    (subcategoria === null || p.fk_subcategoria === subcategoria) &&
    `${p.nom_prod} ${p.marca}`.toLowerCase().includes(busqueda.toLowerCase())
  )

  const bajos = productos.reduce((total, p) => total + p.variantes_bajas, 0)

  return (
    <Pantalla
      titulo="Productos"
      accion={
        <button className="btn-agregar" onClick={() => navigate('/productos/nuevo')} aria-label="Agregar producto">
          <Plus size={20} /><span>Agregar producto</span>
        </button>
      }
    >
      <main className="contenido">
        {bajos > 0 && (
          <div className="alerta">
            <Info />{bajos} {bajos === 1 ? 'variante con poca existencia' : 'variantes con poca existencia'}
          </div>
        )}

        <label className="buscador">
          <Search />
          <input placeholder="Buscar producto o marca" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </label>

        <p className="etiqueta-seccion">CATEGORÍA Y SUBCATEGORÍA</p>
        <div className="filtros">
          <Chips
            opciones={categorias.map((c) => ({ id: c.pk_categoria, nombre: c.nom_categoria }))}
            valor={categoria}
            onChange={cambiarCategoria}
          />
          <Chips
            opciones={subVisibles.map((s) => ({ id: s.pk_subcategoria, nombre: s.nom_subcategoria }))}
            valor={subcategoria}
            onChange={setSubcategoria}
          />
        </div>

        {error && <p className="error">{error}</p>}

        <section className="lista">
          <div className="resumen">
            <strong>{filtrados.length} {filtrados.length === 1 ? 'producto' : 'productos'}</strong>
            <span>Existencia total</span>
          </div>
          {filtrados.map((p) => (
            <TarjetaProducto key={p.pk_prod} {...p} onClick={() => navigate(`/productos/${p.pk_prod}/variantes`)} />
          ))}
          {!filtrados.length && !error && <p className="vacio">No hay productos</p>}
        </section>
      </main>

      <button className="fab solo-movil" aria-label="Agregar producto" onClick={() => navigate('/productos/nuevo')}><Plus /></button>
    </Pantalla>
  )
}
