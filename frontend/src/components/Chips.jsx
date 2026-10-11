export default function Chips({ opciones, valor, onChange }) {
  return (
    <div className="chips">
      <button className={`chip ${valor === null ? 'activo' : ''}`} onClick={() => onChange(null)}>Todas</button>
      {opciones.map((o) => (
        <button key={o.id} className={`chip ${o.id === valor ? 'activo' : ''}`} onClick={() => onChange(o.id)}>
          {o.nombre}
        </button>
      ))}
    </div>
  )
}
