import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from './Icons.jsx'

export function Campo({ label, children }) {
  return (
    <div className="campo">
      <label>{label}</label>
      {children}
    </div>
  )
}

export function Entrada(props) {
  return <div className="entrada"><input {...props} /></div>
}

export function Select({ value, onChange, opciones, placeholder = 'Seleccionar' }) {
  return (
    <div className="entrada">
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {opciones.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown />
    </div>
  )
}

export function Lectura({ valor }) {
  return <div className="entrada lectura">{valor}</div>
}

// Campo de texto con lista de sugerencias: se puede elegir una opción o escribir otra
export function Combo({ value, onChange, opciones, placeholder, maxLength }) {
  const [abierto, setAbierto] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const fuera = (e) => { if (ref.current && !ref.current.contains(e.target)) setAbierto(false) }
    document.addEventListener('pointerdown', fuera)
    return () => document.removeEventListener('pointerdown', fuera)
  }, [])

  const texto = value.toLowerCase()
  const exacta = opciones.some((o) => o.toLowerCase() === texto)
  const lista = !value || exacta ? opciones : opciones.filter((o) => o.toLowerCase().includes(texto))

  return (
    <div className="combo" ref={ref}>
      <div className="entrada">
        <input
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          onFocus={() => setAbierto(true)}
          onChange={(e) => { onChange(e.target.value); setAbierto(true) }}
          onKeyDown={(e) => { if (e.key === 'Escape') setAbierto(false) }}
        />
        <button type="button" className="btn-icono" tabIndex={-1} aria-label="Ver opciones" onClick={() => setAbierto(!abierto)}>
          <ChevronDown />
        </button>
      </div>
      {abierto && lista.length > 0 && (
        <ul className="combo-lista">
          {lista.map((o) => (
            <li key={o}>
              <button type="button" className={o === value ? 'activa' : ''} onClick={() => { onChange(o); setAbierto(false) }}>{o}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
