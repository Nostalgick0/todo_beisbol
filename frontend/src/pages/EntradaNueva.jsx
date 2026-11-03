import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { BACKEND_URL } from '../Backend.jsx'
import Pantalla from '../components/Pantalla.jsx'
import CamposEntrada, { ENTRADA_VACIA, cambiarCampoEntrada, entradaValida, datosEntrada } from '../components/CamposEntrada.jsx'
import { mensajeError } from '../data/formato.js'

export default function EntradaNueva() {
  const navigate = useNavigate()
  const [f, setF] = useState(ENTRADA_VACIA)
  const [proveedores, setProveedores] = useState([])
  const [productos, setProductos] = useState([])
  const [variantes, setVariantes] = useState([])
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    Promise.all([
      axios.get(`${BACKEND_URL}/obtenerProveedores`),
      axios.get(`${BACKEND_URL}/obtenerProductos`),
      axios.get(`${BACKEND_URL}/obtenerVariantes`),
    ])
      .then(([pv, p, v]) => {
        setProveedores(pv.data)
        setProductos(p.data)
        setVariantes(v.data)
      })
      .catch(() => setError('No se pudo cargar la información'))
  }, [])

  const set = (campo, valor) => setF((actual) => cambiarCampoEntrada(actual, campo, valor))

  const guardar = async () => {
    if (!entradaValida(f)) return setError('Completa los campos obligatorios')
    setError('')
    setGuardando(true)
    try {
      await axios.post(`${BACKEND_URL}/insertarEntrada`, datosEntrada(f))
      navigate('/entradas')
    } catch (e) {
      setError(mensajeError(e, 'No se pudo guardar la entrada'))
      setGuardando(false)
    }
  }

  return (
    <Pantalla
      titulo="Registrar entrada"
      volver="/entradas"
      chico
      pie={
        <>
          {error && <p className="error">{error}</p>}
          <button className="btn-primario" onClick={guardar} disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar'}</button>
        </>
      }
    >
      <div className="formulario">
        <CamposEntrada completo f={f} set={set} proveedores={proveedores} productos={productos} variantes={variantes} />
      </div>
    </Pantalla>
  )
}
