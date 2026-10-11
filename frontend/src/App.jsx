import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Productos from './pages/Productos.jsx'
import ProductoNuevo from './pages/ProductoNuevo.jsx'
import Variantes from './pages/Variantes.jsx'
import Categorias from './pages/Categorias.jsx'
import Subcategorias from './pages/Subcategorias.jsx'

function RutaPrivada({ children }) {
  return localStorage.getItem('usuario') ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/productos" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/productos" element={<RutaPrivada><Productos /></RutaPrivada>} />
      <Route path="/productos/nuevo" element={<RutaPrivada><ProductoNuevo /></RutaPrivada>} />
      <Route path="/productos/:id/variantes" element={<RutaPrivada><Variantes /></RutaPrivada>} />
      <Route path="/categorias" element={<RutaPrivada><Categorias /></RutaPrivada>} />
      <Route path="/subcategorias" element={<RutaPrivada><Subcategorias /></RutaPrivada>} />
    </Routes>
  )
}
