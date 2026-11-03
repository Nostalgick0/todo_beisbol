import Catalogo from './Catalogo.jsx'
import { Truck } from '../components/Icons.jsx'

export default function Proveedores() {
  return (
    <Catalogo
      titulo="Proveedores"
      singular="proveedor"
      Icono={Truck}
      pk="pk_proveedor"
      nom="nombre_proveedor"
      masculino
      maxNombre={50}
      textoDesactivar="¿Estás seguro que deseas desactivar el proveedor? Esta acción es irreversible."
      rutas={{ obtener: 'obtenerProveedores', insertar: 'insertarProveedor', actualizar: 'actualizarProveedor', estado: 'cambiarEstadoProveedor' }}
    />
  )
}
