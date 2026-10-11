import { Layers, TriangleAlert, X } from './Icons.jsx'

export function Modal({ titulo, icono, onCerrar, children }) {
  return (
    <div className="modal-fondo" onClick={onCerrar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-cab">
          {icono || <Layers />}
          <h2>{titulo}</h2>
          <button className="btn-icono" onClick={onCerrar} aria-label="Cerrar"><X /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Confirmar({ titulo, texto, onCancelar, onConfirmar }) {
  return (
    <div className="modal-fondo" onClick={onCancelar}>
      <div className="modal confirmar" onClick={(e) => e.stopPropagation()}>
        <div className="modal-cab">
          <TriangleAlert />
          <h2 className="negro">{titulo}</h2>
          <button className="btn-icono" onClick={onCancelar} aria-label="Cerrar"><X /></button>
        </div>
        <p className="confirmar-texto">{texto}</p>
        <div className="modal-acciones">
          <button className="btn-borde gris" onClick={onCancelar}>Cancelar</button>
          <button className="btn-borde rojo" onClick={onConfirmar}>Desactivar</button>
        </div>
      </div>
    </div>
  )
}
