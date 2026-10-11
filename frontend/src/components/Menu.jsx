import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Chevron, X, Logout } from './Icons.jsx'
import { SECCIONES_INVENTARIO as SUB, OTRAS_SECCIONES } from '../data/navegacion.js'

const DURACION_SALIDA = 280 // ms, debe coincidir con la animación "panel-sube" del CSS

export default function Menu({ onCerrar }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [inventario, setInventario] = useState(true)
  const [saliendo, setSaliendo] = useState(false)

  // Primero se reproduce la animación de subida; después se cierra y, si hay, se navega
  const cerrar = (despues) => {
    if (saliendo) return
    setSaliendo(true)
    setTimeout(() => {
      onCerrar()
      despues?.()
    }, DURACION_SALIDA)
  }

  const salir = () => cerrar(() => {
    localStorage.removeItem('usuario')
    navigate('/login')
  })

  return (
    <div className={`menu-fondo ${saliendo ? 'saliendo' : ''}`} onClick={() => cerrar()}>
      <nav className="menu-panel" onClick={(e) => e.stopPropagation()}>
        <div className="menu-top">
          <span className="menu-marca">Todo Beisbol</span>
          <button className="menu-x" onClick={() => cerrar()} aria-label="Cerrar menú"><X size={24} /></button>
        </div>

        <button className="menu-grupo" onClick={() => setInventario(!inventario)} aria-expanded={inventario}>
          Inventario <Chevron className={`chevron ${inventario ? 'abierto' : ''}`} />
        </button>

        <div className={`menu-desplegable ${inventario ? 'abierto' : ''}`}>
          <div className="menu-desplegable-int">
            {SUB.map(({ ruta, texto, Icono }, i) => (
              <button
                key={ruta}
                className={`menu-sub ${pathname.startsWith(ruta) ? 'actual' : ''}`}
                style={{ transitionDelay: inventario ? `${70 + i * 55}ms` : '0ms' }}
                tabIndex={inventario ? 0 : -1}
                onClick={() => cerrar(() => { if (pathname !== ruta) navigate(ruta) })}
              >
                <span className="menu-ico"><Icono size={20} /></span>{texto}
              </button>
            ))}
          </div>
        </div>

        {OTRAS_SECCIONES.map((texto) => <button key={texto} className="menu-item">{texto}</button>)}

        <button className="btn-salir" onClick={salir}><Logout />Cerrar sesión</button>
      </nav>
    </div>
  )
}
