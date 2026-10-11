import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Menu as IconoMenu } from './Icons.jsx'
import Menu from './Menu.jsx'
import BarraNavegacion from './BarraNavegacion.jsx'

// Navegación + encabezado compartidos por todas las pantallas.
// Celular y tablet: menú lateral con botón de hamburguesa. Escritorio: barra superior.
export default function Pantalla({ titulo, volver, chico, subtitulo, accion, pie, pieSoloMovil, children }) {
  const navigate = useNavigate()
  const [menu, setMenu] = useState(false)

  return (
    <>
      <BarraNavegacion />
      <div className="pantalla">
        <header className="encabezado">
          {volver && (
            <button className="btn-icono volver" onClick={() => navigate(volver)} aria-label="Volver"><ArrowLeft /></button>
          )}
          <h1 className={chico ? 'titulo-chico' : ''}>{titulo}</h1>
          {accion}
          <button className="btn-icono btn-menu" onClick={() => setMenu(true)} aria-label="Menú"><IconoMenu /></button>
        </header>
        {subtitulo && <p className="subtitulo">{subtitulo}</p>}
        {children}
        {pie && <div className={`accion-fija ${pieSoloMovil ? 'solo-movil' : ''}`}>{pie}</div>}
        {menu && <Menu onCerrar={() => setMenu(false)} />}
      </div>
    </>
  )
}
