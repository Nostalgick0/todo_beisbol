const db = require('./db');

//una variante se considera con poca existencia si le queda esta cantidad o menos
const STOCK_BAJO = 1;

//°---------------------------------°
//|                                 |
//|              Login              |
//|                                 |
//°---------------------------------°

async function login(nom_usuario, password) {
    // Busca el usuario por su nombre de usuario
    const [rows] = await db.query(
        'SELECT pk_usuario, nom_usuario, password, rol, estatus FROM usuarios WHERE nom_usuario = ?',
        [nom_usuario]
    );

    // Si no se encontró ningún usuario con ese nombre de usuario
    if (rows.length === 0) {
        throw new Error('Usuario no encontrado');
    }

    const usuario = rows[0];

    // Verifica que el usuario esté activo
    if (usuario.estatus !== 1) {
        throw new Error('Usuario inactivo');
    }

    // Compara la contraseña ingresada directamente con la de la bd
    if (password !== usuario.password) {
        throw new Error('Contraseña incorrecta');
    }

    // No regreses la contraseña al frontend
    delete usuario.password;

    return usuario;
}

//---------------------------------------------------------------------------------------------------

//°---------------------------------°
//|                                 |
//|            CATEGORÍAS           |
//|                                 |
//°---------------------------------°

async function getCategorias() {
    const [rows] = await db.query('SELECT pk_categoria, nom_categoria, estatus FROM categorias');

    return rows;
}

async function insertCategoria(nom_categoria) {
    const [rows] = await db.query(
        'INSERT INTO categorias (nom_categoria, estatus) VALUES (?, 1)',
        [nom_categoria]
    );

    return rows;
}

async function actualizarCategoria(pk_categoria, nom_categoria, estatus) {
    const [rows] = await db.query(
        'UPDATE categorias SET nom_categoria = ?, estatus = ? WHERE pk_categoria = ?',
        [nom_categoria, estatus, pk_categoria]
    );

    return rows;
}

async function cambiarEstadoCategoria(pk_categoria, estatus) {
    const [rows] = await db.query(
        'UPDATE categorias SET estatus = ? WHERE pk_categoria = ?',
        [estatus, pk_categoria]
    );

    return rows;
}

//---------------------------------------------------------------------------------------------------

//°---------------------------------°
//|                                 |
//|          SUBCATEGORÍAS          |
//|                                 |
//°---------------------------------°

async function getSubcategorias() {
    const [rows] = await db.query(
        'SELECT s.pk_subcategoria, s.nom_subcategoria, s.fk_categoria, c.nom_categoria, s.estatus \
        FROM subcategorias s \
        LEFT JOIN categorias c ON s.fk_categoria = c.pk_categoria'
    );

    return rows;
}

async function insertSubcategoria(nom_subcategoria, fk_categoria) {
    const [rows] = await db.query(
        'INSERT INTO subcategorias (nom_subcategoria, fk_categoria, estatus) VALUES (?, ?, 1)',
        [nom_subcategoria, fk_categoria]
    );

    return rows;
}

async function actualizarSubcategoria(pk_subcategoria, nom_subcategoria, fk_categoria, estatus) {
    const [rows] = await db.query(
        'UPDATE subcategorias SET nom_subcategoria = ?, fk_categoria = ?, estatus = ? WHERE pk_subcategoria = ?',
        [nom_subcategoria, fk_categoria, estatus, pk_subcategoria]
    );

    return rows;
}

async function cambiarEstadoSubcategoria(pk_subcategoria, estatus) {
    const [rows] = await db.query(
        'UPDATE subcategorias SET estatus = ? WHERE pk_subcategoria = ?',
        [estatus, pk_subcategoria]
    );

    return rows;
}

//---------------------------------------------------------------------------------------------------

//°---------------------------------°
//|                                 |
//|            PRODUCTOS            |
//|                                 |
//°---------------------------------°

//regresa cada producto con su total de variantes activas, existencia total,
//cuántas variantes tienen poca existencia y la menor existencia baja ("Queda N")
async function getProductos() {
    const [rows] = await db.query(
        'SELECT p.pk_prod, p.nom_prod, p.marca, p.fk_categoria, p.fk_subcategoria, p.estatus, \
                COUNT(v.pk_variante) AS num_variantes, \
                CAST(COALESCE(SUM(v.stock), 0) AS SIGNED) AS existencia, \
                CAST(COALESCE(SUM(v.stock <= ?), 0) AS SIGNED) AS variantes_bajas, \
                MIN(CASE WHEN v.stock <= ? THEN v.stock END) AS queda \
        FROM productos p \
        LEFT JOIN variantes v ON v.fk_producto = p.pk_prod AND v.estatus = 1 \
        GROUP BY p.pk_prod',
        [STOCK_BAJO, STOCK_BAJO]
    );

    return rows;
}

async function insertProducto(nom_prod, marca, fk_categoria, fk_subcategoria) {
    const [rows] = await db.query(
        'INSERT INTO productos (nom_prod, marca, fk_categoria, fk_subcategoria, estatus) VALUES (?, ?, ?, ?, 1)',
        [nom_prod, marca, fk_categoria, fk_subcategoria || null]
    );

    return rows;
}

async function actualizarProducto(pk_prod, nom_prod, marca, fk_categoria, fk_subcategoria) {
    const [rows] = await db.query(
        'UPDATE productos SET nom_prod = ?, marca = ?, fk_categoria = ?, fk_subcategoria = ? WHERE pk_prod = ?',
        [nom_prod, marca, fk_categoria, fk_subcategoria || null, pk_prod]
    );

    return rows;
}

async function cambiarEstadoProducto(pk_prod, estatus) {
    const [rows] = await db.query(
        'UPDATE productos SET estatus = ? WHERE pk_prod = ?',
        [estatus, pk_prod]
    );

    return rows;
}

//registra un producto con su primera variante; si algo falla no se guarda nada
async function insertProductoConVariante(p, v) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [prod] = await connection.query(
            'INSERT INTO productos (nom_prod, marca, fk_categoria, fk_subcategoria, estatus) VALUES (?, ?, ?, ?, 1)',
            [p.nom_prod, p.marca, p.fk_categoria, p.fk_subcategoria || null]
        );

        await connection.query(
            'INSERT INTO variantes (fk_producto, estilo, talla, color, tipo_publico, tipo_caja, precio_venta, stock, estatus) \
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)',
            [prod.insertId, v.estilo, v.talla, v.color, v.tipo_publico, v.tipo_caja || null, v.precio_venta, v.stock]
        );

        await connection.commit();
        return { pk_prod: prod.insertId };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

//---------------------------------------------------------------------------------------------------

//°---------------------------------°
//|                                 |
//|            VARIANTES            |
//|                                 |
//°---------------------------------°

async function getVariantes() {
    const [rows] = await db.query(
        'SELECT v.pk_variante, v.fk_producto, p.nom_prod, v.estilo, v.talla, v.color, \
                v.tipo_publico, v.tipo_caja, v.precio_venta, v.stock, v.estatus, \
                (v.stock <= ?) AS bajo_stock \
        FROM variantes v \
        LEFT JOIN productos p ON v.fk_producto = p.pk_prod',
        [STOCK_BAJO]
    );

    return rows;
}

async function insertVariante(fk_producto, estilo, talla, color, tipo_publico, tipo_caja, precio_venta, stock) {
    const [rows] = await db.query(
        'INSERT INTO variantes (fk_producto, estilo, talla, color, tipo_publico, tipo_caja, precio_venta, stock, estatus) \
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)',
        [fk_producto, estilo, talla, color, tipo_publico, tipo_caja || null, precio_venta, stock]
    );

    return rows;
}

async function actualizarVariante(pk_variante, fk_producto, estilo, talla, color, tipo_publico, tipo_caja, precio_venta, stock, estatus) {
    const [rows] = await db.query(
        'UPDATE variantes SET fk_producto = ?, estilo = ?, talla = ?, color = ?, tipo_publico = ?, \
                tipo_caja = ?, precio_venta = ?, stock = ?, estatus = ? \
        WHERE pk_variante = ?',
        [fk_producto, estilo, talla, color, tipo_publico, tipo_caja || null, precio_venta, stock, estatus, pk_variante]
    );

    return rows;
}

async function cambiarEstadoVariante(pk_variante, estatus) {
    const [rows] = await db.query(
        'UPDATE variantes SET estatus = ? WHERE pk_variante = ?',
        [estatus, pk_variante]
    );

    return rows;
}

//---------------------------------------------------------------------------------------------------

//°---------------------------------°
//|                                 |
//|           PROVEEDORES           |
//|                                 |
//°---------------------------------°

async function getProveedores() {
    const [rows] = await db.query('SELECT pk_proveedor, nombre_proveedor, estatus FROM proveedores');

    return rows;
}

async function insertProveedor(nombre_proveedor) {
    const [rows] = await db.query(
        'INSERT INTO proveedores (nombre_proveedor, estatus) VALUES (?, 1)',
        [nombre_proveedor]
    );

    return rows;
}

async function actualizarProveedor(pk_proveedor, nombre_proveedor, estatus) {
    const [rows] = await db.query(
        'UPDATE proveedores SET nombre_proveedor = ?, estatus = ? WHERE pk_proveedor = ?',
        [nombre_proveedor, estatus, pk_proveedor]
    );

    return rows;
}

async function cambiarEstadoProveedor(pk_proveedor, estatus) {
    const [rows] = await db.query(
        'UPDATE proveedores SET estatus = ? WHERE pk_proveedor = ?',
        [estatus, pk_proveedor]
    );

    return rows;
}

//---------------------------------------------------------------------------------------------------

//°---------------------------------°
//|                                 |
//|       ENTRADAS DE MERCANCÍA     |
//|                                 |
//°---------------------------------°

//Una entrada ACTIVA suma su cantidad al stock de su variante. Por eso registrar, editar y
//activar/desactivar una entrada también ajustan el stock (todo dentro de una transacción).

//error "de negocio": el index.js lo regresa tal cual al frontend con código 400
function errorNegocio(mensaje) {
    const error = new Error(mensaje);
    error.status = 400;
    return error;
}

//ejecuta una función dentro de una transacción; si algo falla no se guarda nada
async function enTransaccion(funcion) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const resultado = await funcion(connection);
        await connection.commit();
        return resultado;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

//suma (o resta, si es negativo) piezas al stock de una variante sin dejarlo en negativo
async function ajustarStock(connection, fk_variante, cantidad) {
    if (cantidad === 0) return;

    const [rows] = await connection.query(
        'UPDATE variantes SET stock = stock + ? WHERE pk_variante = ? AND stock + ? >= 0',
        [cantidad, fk_variante, cantidad]
    );

    if (rows.affectedRows === 0) {
        throw errorNegocio('La variante no tiene existencia suficiente para este cambio');
    }
}

function validarEntrada({ cantidad, costo_unidad }) {
    if (!Number.isInteger(cantidad) || cantidad < 1) {
        throw errorNegocio('La cantidad debe ser un número entero mayor a 0');
    }
    if (!(costo_unidad >= 0)) {
        throw errorNegocio('El costo unitario no es válido');
    }
}

//la variante tiene que pertenecer al producto elegido
async function validarVariante(connection, fk_producto, fk_variante) {
    const [rows] = await connection.query(
        'SELECT 1 FROM variantes WHERE pk_variante = ? AND fk_producto = ?',
        [fk_variante, fk_producto]
    );

    if (rows.length === 0) {
        throw errorNegocio('La variante no pertenece al producto seleccionado');
    }
}

//la fecha se regresa como texto (AAAA-MM-DD) para que no se corra por zona horaria
async function getEntradas() {
    const [rows] = await db.query(
        "SELECT e.pk_entrada, e.fk_proveedor, pr.nombre_proveedor, DATE_FORMAT(e.fecha, '%Y-%m-%d') AS fecha, \
                e.fk_producto, p.nom_prod, p.marca, e.fk_variante, v.estilo, v.talla, v.color, \
                e.cantidad, e.costo_unidad, e.total, e.estatus \
        FROM entradas_mercancia e \
        LEFT JOIN proveedores pr ON e.fk_proveedor = pr.pk_proveedor \
        LEFT JOIN productos p ON e.fk_producto = p.pk_prod \
        LEFT JOIN variantes v ON e.fk_variante = v.pk_variante \
        ORDER BY e.fecha DESC, e.pk_entrada DESC"
    );

    return rows;
}

//el total lo calcula el servidor (cantidad x costo unitario), no se confía en el del frontend
async function insertEntrada(fk_proveedor, fecha, fk_producto, fk_variante, cantidad, costo_unidad) {
    validarEntrada({ cantidad, costo_unidad });

    return enTransaccion(async (connection) => {
        await validarVariante(connection, fk_producto, fk_variante);

        const [rows] = await connection.query(
            'INSERT INTO entradas_mercancia (fk_proveedor, fecha, fk_producto, fk_variante, cantidad, costo_unidad, total, estatus) \
            VALUES (?, ?, ?, ?, ?, ?, ROUND(? * ?, 2), 1)',
            [fk_proveedor, fecha, fk_producto, fk_variante, cantidad, costo_unidad, cantidad, costo_unidad]
        );

        await ajustarStock(connection, fk_variante, cantidad);

        return rows;
    });
}

async function actualizarEntrada(pk_entrada, fk_proveedor, fecha, fk_producto, fk_variante, cantidad, costo_unidad, estatus) {
    validarEntrada({ cantidad, costo_unidad });

    return enTransaccion(async (connection) => {
        //se bloquea la entrada para leer su estado anterior sin que nadie la cambie a la vez
        const [anterior] = await connection.query(
            'SELECT fk_variante, cantidad, estatus FROM entradas_mercancia WHERE pk_entrada = ? FOR UPDATE',
            [pk_entrada]
        );
        if (anterior.length === 0) throw errorNegocio('La entrada no existe');

        await validarVariante(connection, fk_producto, fk_variante);

        //efecto neto en el stock de cada variante: se quita lo que aportaba antes y se pone lo nuevo
        const cambios = new Map();
        if (anterior[0].estatus === 1) {
            cambios.set(anterior[0].fk_variante, -anterior[0].cantidad);
        }
        if (estatus === 1) {
            cambios.set(fk_variante, (cambios.get(fk_variante) || 0) + cantidad);
        }
        for (const [variante, cambio] of cambios) {
            await ajustarStock(connection, variante, cambio);
        }

        const [rows] = await connection.query(
            'UPDATE entradas_mercancia SET fk_proveedor = ?, fecha = ?, fk_producto = ?, fk_variante = ?, \
                    cantidad = ?, costo_unidad = ?, total = ROUND(? * ?, 2), estatus = ? \
            WHERE pk_entrada = ?',
            [fk_proveedor, fecha, fk_producto, fk_variante, cantidad, costo_unidad, cantidad, costo_unidad, estatus, pk_entrada]
        );

        return rows;
    });
}

async function cambiarEstadoEntrada(pk_entrada, estatus) {
    return enTransaccion(async (connection) => {
        const [anterior] = await connection.query(
            'SELECT fk_variante, cantidad, estatus FROM entradas_mercancia WHERE pk_entrada = ? FOR UPDATE',
            [pk_entrada]
        );
        if (anterior.length === 0) throw errorNegocio('La entrada no existe');

        //desactivar quita sus piezas del stock; activar las vuelve a poner
        if (anterior[0].estatus !== estatus) {
            await ajustarStock(connection, anterior[0].fk_variante, estatus === 1 ? anterior[0].cantidad : -anterior[0].cantidad);
        }

        const [rows] = await connection.query(
            'UPDATE entradas_mercancia SET estatus = ? WHERE pk_entrada = ?',
            [estatus, pk_entrada]
        );

        return rows;
    });
}

//---------------------------------------------------------------------------------------------------

//exportamos las funciones para poder utilizarlas
module.exports = {
    login,
    getCategorias,
    insertCategoria,
    actualizarCategoria,
    cambiarEstadoCategoria,
    getSubcategorias,
    insertSubcategoria,
    actualizarSubcategoria,
    cambiarEstadoSubcategoria,
    getProductos,
    insertProducto,
    actualizarProducto,
    cambiarEstadoProducto,
    insertProductoConVariante,
    getVariantes,
    insertVariante,
    actualizarVariante,
    cambiarEstadoVariante,
    getProveedores,
    insertProveedor,
    actualizarProveedor,
    cambiarEstadoProveedor,
    getEntradas,
    insertEntrada,
    actualizarEntrada,
    cambiarEstadoEntrada
};
