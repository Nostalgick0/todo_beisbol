import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Chevron, Logout } from './Icons.jsx'
import { SECCIONES_INVENTARIO, OTRAS_SECCIONES } from '../data/navegacion.js'

// Barra superior para pantallas de escritorio (en celular y tablet se usa el menú lateral)
export default function BarraNavegacion() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [abierto, setAbierto] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const fuera = (e) => { if (ref.current && !ref.current.contains(e.target)) setAbierto(false) }
    const tecla = (e) => { if (e.key === 'Escape') setAbierto(false) }
    document.addEventListener('pointerdown', fuera)
    document.addEventListener('keydown', tecla)
    return () => {
      document.removeEventListener('pointerdown', fuera)
      document.removeEventListener('keydown', tecla)
    }
  }, [])

  const enInventario = SECCIONES_INVENTARIO.some((s) => pathname.startsWith(s.ruta))

  const ir = (ruta) => {
    setAbierto(false)
    if (pathname !== ruta) navigate(ruta)
  }

  const salir = () => {
    localStorage.removeItem('usuario')
    navigate('/login')
  }

  return (
    <header className="barra">
      <div className="barra-int">
        <span className="barra-marca">Todo Beisbol</span>

        <nav className="barra-nav">
          <div className="barra-grupo" ref={ref}>
            <button className={`barra-link ${enInventario ? 'actual' : ''}`} onClick={() => setAbierto(!abierto)} aria-expanded={abierto}>
              Inventario <Chevron className={`chevron ${abierto ? 'abierto' : ''}`} />
            </button>
            <div className={`barra-drop ${abierto ? 'abierto' : ''}`}>
              {SECCIONES_INVENTARIO.map(({ ruta, texto, Icono }) => (
                <button
                  key={ruta}
                  className={`barra-drop-item ${pathname.startsWith(ruta) ? 'actual' : ''}`}
                  tabIndex={abierto ? 0 : -1}
                  onClick={() => ir(ruta)}
                >
                  <span className="menu-ico"><Icono size={20} /></span>{texto}
                </button>
              ))}
            </div>
          </div>

          {OTRAS_SECCIONES.map((texto) => <button key={texto} className="barra-link">{texto}</button>)}
        </nav>

        <button className="barra-salir" onClick={salir}><Logout size={18} />Cerrar sesión</button>
      </div>
    </header>
  )
}
