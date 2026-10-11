import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { BACKEND_URL } from '../Backend.jsx'
import Pantalla from '../components/Pantalla.jsx'
import CamposVariante from '../components/CamposVariante.jsx'
import { Campo, Entrada, Select } from '../components/Campo.jsx'

const VARIANTE = { estilo: '', talla: '', color: '', tipo_publico: '', tipo_caja: '', precio_venta: '', stock: '' }

export default function ProductoNuevo() {
  const navigate = useNavigate()
  const [categorias, setCategorias] = useState([])
  const [subcategorias, setSubcategorias] = useState([])
  const [p, setP] = useState({ nom_prod: '', marca: '', fk_categoria: '', fk_subcategoria: '' })
  const [v, setV] = useState(VARIANTE)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    Promise.all([
      axios.get(`${BACKEND_URL}/obtenerCategorias`),
      axios.get(`${BACKEND_URL}/obtenerSubcategorias`),
    ])
      .then(([c, s]) => {
        setCategorias(c.data.filter((x) => x.estatus === 1))
        setSubcategorias(s.data.filter((x) => x.estatus === 1))
      })
      .catch(() => setError('No se pudo cargar la información'))
  }, [])

  const setProd = (campo, valor) => setP({ ...p, [campo]: valor, ...(campo === 'fk_categoria' && { fk_subcategoria: '' }) })
  const setVar = (campo, valor) => setV({ ...v, [campo]: valor })

  const guardar = async () => {
    if (!p.nom_prod || !p.marca || !p.fk_categoria || !v.estilo || !v.talla || !v.color || !v.tipo_publico || v.precio_venta === '' || v.stock === '') {
      return setError('Completa los campos obligatorios')
    }
    setError('')
    setGuardando(true)
    try {
      await axios.post(`${BACKEND_URL}/insertarProductoVariante`, {
        ...p,
        fk_categoria: Number(p.fk_categoria),
        fk_subcategoria: p.fk_subcategoria ? Number(p.fk_subcategoria) : null,
        ...v,
        precio_venta: Number(v.precio_venta),
        stock: Number(v.stock),
      })
      navigate('/productos')
    } catch {
      setError('No se pudo guardar el producto')
      setGuardando(false)
    }
  }

  const subOpciones = subcategorias
    .filter((s) => s.fk_categoria === Number(p.fk_categoria))
    .map((s) => ({ value: String(s.pk_subcategoria), label: s.nom_subcategoria }))

  return (
    <Pantalla
      titulo="Producto y variante"
      volver="/productos"
      chico
      pie={
        <>
          {error && <p className="error">{error}</p>}
          <button className="btn-primario" onClick={guardar} disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar'}</button>
        </>
      }
    >
      <div className="formulario">
        <h2>Datos del producto</h2>
        <Campo label="Nombre del producto">
          <Entrada placeholder="Escribe el nombre del producto" value={p.nom_prod} onChange={(e) => setProd('nom_prod', e.target.value)} />
        </Campo>
        <Campo label="Marca">
          <Entrada placeholder="Escribe la marca del producto" value={p.marca} onChange={(e) => setProd('marca', e.target.value)} />
        </Campo>
        <div className="fila">
          <Campo label="Categoría">
            <Select
              value={p.fk_categoria}
              onChange={(x) => setProd('fk_categoria', x)}
              opciones={categorias.map((c) => ({ value: String(c.pk_categoria), label: c.nom_categoria }))}
            />
          </Campo>
          <Campo label="Subcategoría">
            <Select value={p.fk_subcategoria} onChange={(x) => setProd('fk_subcategoria', x)} opciones={subOpciones} />
          </Campo>
        </div>

        <h2>Datos de la variante</h2>
        <CamposVariante v={v} set={setVar} selects />
      </div>
    </Pantalla>
  )
}
