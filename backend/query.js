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
    cambiarEstadoVariante
};
