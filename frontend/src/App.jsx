import { Routes, Route, Navigate } from 'react-router-dom'

function RutaPrivada({ children }) {
  return localStorage.getItem('usuario') ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/productos" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/productos" element={<RutaPrivada><Productos /></RutaPrivada>} />
      <Route path="/variantes" element={<RutaPrivada><Variantes /></RutaPrivada>} />
      <Route path="/categorias" element={<RutaPrivada><Categorías /></RutaPrivada>} />
      <Route path="/subcategorias" element={<RutaPrivada><Subcategorías /></RutaPrivada>} />
    </Routes>
  )
}
