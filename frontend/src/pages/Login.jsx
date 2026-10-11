import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { BACKEND_URL } from '../Backend.jsx'
import { Eye, EyeOff } from '../components/Icons.jsx'
import logo from '../assets/logo.png'

export default function Login() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [ver, setVer] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const enviar = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      const { data } = await axios.post(`${BACKEND_URL}/login`, { nom_usuario: usuario, password })
      localStorage.setItem('usuario', JSON.stringify(data.usuario))
      navigate('/productos')
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo conectar con el servidor')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="pantalla login">
      <form className="login-card" onSubmit={enviar}>
        <img className="login-logo" src={logo} alt="Todo Beisbol" />
        <p className="login-sub">Sistema de Gestión</p>

        <div className="campos">
          <div className="campo">
            <label htmlFor="usuario">Usuario</label>
            <div className="entrada">
              <input id="usuario" placeholder="Escribe tu usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
            </div>
          </div>
          <div className="campo">
            <label htmlFor="clave">Contraseña</label>
            <div className="entrada">
              <input id="clave" type={ver ? 'text' : 'password'} placeholder="Escribe tu contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" className="btn-icono" onClick={() => setVer(!ver)} aria-label="Mostrar contraseña">
                {ver ? <Eye /> : <EyeOff />}
              </button>
            </div>
          </div>
        </div>

        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn-primario" disabled={cargando}>
          {cargando ? 'Entrando…' : 'Iniciar sesión'}
        </button>
      </form>
    </div>
  )
}
