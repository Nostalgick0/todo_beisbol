import Catalogo from './Catalogo.jsx'
import { ListTree } from '../components/Icons.jsx'

export default function Subcategorias() {
  return (
    <Catalogo
      titulo="Subcategorías"
      singular="subcategoría"
      Icono={ListTree}
      pk="pk_subcategoria"
      nom="nom_subcategoria"
      conCategoria
      rutas={{ obtener: 'obtenerSubcategorias', insertar: 'insertarSubcategoria', actualizar: 'actualizarSubcategoria', estado: 'cambiarEstadoSubcategoria' }}
    />
  )
}
