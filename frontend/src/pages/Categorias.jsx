import Catalogo from './Catalogo.jsx'
import { Tag } from '../components/Icons.jsx'

export default function Categorias() {
  return (
    <Catalogo
      titulo="Categorías"
      singular="categoría"
      Icono={Tag}
      pk="pk_categoria"
      nom="nom_categoria"
      rutas={{ obtener: 'obtenerCategorias', insertar: 'insertarCategoria', actualizar: 'actualizarCategoria', estado: 'cambiarEstadoCategoria' }}
    />
  )
}
