const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
export const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

const FORMATO_MONEDA = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })

// 4200 -> "$4,200.00"
export const moneda = (n) => FORMATO_MONEDA.format(Number(n) || 0)

// La fecha llega del backend como texto "AAAA-MM-DD"; se separa a mano para que la zona horaria no la mueva de día
const partes = (fecha) => fecha.split('-')

// "2026-10-28" -> "28 oct 2026"
export const fechaCorta = (fecha) => {
  const [a, m, d] = partes(fecha)
  return `${d} ${MESES_CORTOS[Number(m) - 1]} ${a}`
}

// "2026-10-15" -> "15/10/2026"
export const fechaNumerica = (fecha) => {
  const [a, m, d] = partes(fecha)
  return `${d}/${m}/${a}`
}

// "Franklin · Talla L · Color Negro"
export const descVariante = (marca, talla, color) => `${marca} · Talla ${talla} · Color ${color}`

// Si el backend mandó un mensaje de validación (código 400) se muestra; si no, el mensaje genérico
export const mensajeError = (e, generico) => (e.response?.status === 400 && e.response.data?.error) || generico
