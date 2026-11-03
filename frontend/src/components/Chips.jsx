// "todos" es el texto del primer chip (quita el filtro): "Todas", "Todos"...
export default function Chips({ opciones, valor, onChange, todos = 'Todas' }) {
  return (
    <div className="chips">
      <button className={`chip ${valor === null ? 'activo' : ''}`} onClick={() => onChange(null)}>{todos}</button>
      {opciones.map((o) => (
        <button key={o.id} className={`chip ${o.id === valor ? 'activo' : ''}`} onClick={() => onChange(o.id)}>
          {o.nombre}
        </button>
      ))}
    </div>
  )
}
