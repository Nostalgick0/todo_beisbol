import { CircleAlert, ChevronRight } from './Icons.jsx'

export default function TarjetaProducto({ nom_prod, marca, num_variantes, existencia, queda, onClick }) {
  return (
    <article className="tarjeta" onClick={onClick}>
      <div className="tarjeta-top">
        <div className="tarjeta-datos">
          <h3>{nom_prod}</h3>
          <p>{marca}</p>
        </div>
        {queda !== null ? (
          <span className="insignia"><CircleAlert />Queda {queda}</span>
        ) : (
          <ChevronRight />
        )}
      </div>
      <div className="tarjeta-pie">
        <span>{num_variantes} {num_variantes === 1 ? 'variante' : 'variantes'}</span>
        <strong>{existencia} en existencia</strong>
      </div>
    </article>
  )
}
