const express = require('express');

const cors = require('cors');

require('dotenv').config();

const query = require('./query');

const app = express();

const PORT = 5002;

app.use(cors());

app.use(express.json());

//°---------------------------------°
//|                                 |
//|              Login              |
//|                                 |
//°---------------------------------°

app.post('/login', async (req, res) => {
    const { nom_usuario, password } = req.body;

    try {
        //query.login es la función que tenemos en query.js
        const usuario = await query.login(nom_usuario, password);
        res.json({ success: true, usuario });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

//---------------------------------------------------------------------------------------------------

//°---------------------------------°
//|                                 |
//|            CATEGORÍAS           |
//|                                 |
//°---------------------------------°

app.get('/obtenerCategorias', async (req, res) => {
    try {
        const categorias = await query.getCategorias();
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las categorías' });
    }
});

app.post('/insertarCategoria', async (req, res) => {
    try {
        const { nom_categoria } = req.body;
        await query.insertCategoria(nom_categoria);
        res.json({ mensaje: 'Categoría insertada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al insertar la categoría' });
    }
});

app.post('/actualizarCategoria', async (req, res) => {
    try {
        const { pk_categoria, nom_categoria, estatus } = req.body;
        await query.actualizarCategoria(pk_categoria, nom_categoria, estatus);
        res.json({ mensaje: 'Categoría actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la categoría' });
    }
});

app.post('/cambiarEstadoCategoria', async (req, res) => {
    try {
        const { pk_categoria, estatus } = req.body;
        await query.cambiarEstadoCategoria(pk_categoria, estatus);
        res.json({ mensaje: 'Estado de la categoría actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el estado de la categoría' });
    }
});

//---------------------------------------------------------------------------------------------------

//°---------------------------------°
//|                                 |
//|          SUBCATEGORÍAS          |
//|                                 |
//°---------------------------------°

app.get('/obtenerSubcategorias', async (req, res) => {
    try {
        const subcategorias = await query.getSubcategorias();
        res.json(subcategorias);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las subcategorías' });
    }
});

app.post('/insertarSubcategoria', async (req, res) => {
    try {
        const { nom_subcategoria, fk_categoria } = req.body;
        await query.insertSubcategoria(nom_subcategoria, fk_categoria);
        res.json({ mensaje: 'Subcategoría insertada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al insertar la subcategoría' });
    }
});

app.post('/actualizarSubcategoria', async (req, res) => {
    try {
        const { pk_subcategoria, nom_subcategoria, fk_categoria, estatus } = req.body;
        await query.actualizarSubcategoria(pk_subcategoria, nom_subcategoria, fk_categoria, estatus);
        res.json({ mensaje: 'Subcategoría actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la subcategoría' });
    }
});

app.post('/cambiarEstadoSubcategoria', async (req, res) => {
    try {
        const { pk_subcategoria, estatus } = req.body;
        await query.cambiarEstadoSubcategoria(pk_subcategoria, estatus);
        res.json({ mensaje: 'Estado de la subcategoría actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el estado de la subcategoría' });
    }
});

//---------------------------------------------------------------------------------------------------

//°---------------------------------°
//|                                 |
//|            PRODUCTOS            |
//|                                 |
//°---------------------------------°

app.get('/obtenerProductos', async (req, res) => {
    try {
        const productos = await query.getProductos();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

app.post('/insertarProducto', async (req, res) => {
    try {
        const { nom_prod, marca, fk_categoria, fk_subcategoria } = req.body;
        await query.insertProducto(nom_prod, marca, fk_categoria, fk_subcategoria);
        res.json({ mensaje: 'Producto insertado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al insertar el producto' });
    }
});

//registra un producto junto con su primera variante (todo o nada)
app.post('/insertarProductoVariante', async (req, res) => {
    try {
        const { nom_prod, marca, fk_categoria, fk_subcategoria, estilo, talla, color, tipo_publico, tipo_caja, precio_venta, stock } = req.body;
        const resultado = await query.insertProductoConVariante(
            { nom_prod, marca, fk_categoria, fk_subcategoria },
            { estilo, talla, color, tipo_publico, tipo_caja, precio_venta, stock }
        );
        res.json({ mensaje: 'Producto registrado correctamente', ...resultado });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar el producto' });
    }
});

app.post('/actualizarProducto', async (req, res) => {
    try {
        const { pk_prod, nom_prod, marca, fk_categoria, fk_subcategoria } = req.body;
        await query.actualizarProducto(pk_prod, nom_prod, marca, fk_categoria, fk_subcategoria);
        res.json({ mensaje: 'Producto actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});

app.post('/cambiarEstadoProducto', async (req, res) => {
    try {
        const { pk_prod, estatus } = req.body;
        await query.cambiarEstadoProducto(pk_prod, estatus);
        res.json({ mensaje: 'Estado del producto actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el estado del producto' });
    }
});

//---------------------------------------------------------------------------------------------------

//°---------------------------------°
//|                                 |
//|            VARIANTES            |
//|                                 |
//°---------------------------------°

app.get('/obtenerVariantes', async (req, res) => {
    try {
        const variantes = await query.getVariantes();
        res.json(variantes);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las variantes' });
    }
});

app.post('/insertarVariante', async (req, res) => {
    try {
        const { fk_producto, estilo, talla, color, tipo_publico, tipo_caja, precio_venta, stock } = req.body;
        await query.insertVariante(fk_producto, estilo, talla, color, tipo_publico, tipo_caja, precio_venta, stock);
        res.json({ mensaje: 'Variante insertada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al insertar la variante' });
    }
});

app.post('/actualizarVariante', async (req, res) => {
    try {
        const { pk_variante, fk_producto, estilo, talla, color, tipo_publico, tipo_caja, precio_venta, stock, estatus } = req.body;
        await query.actualizarVariante(pk_variante, fk_producto, estilo, talla, color, tipo_publico, tipo_caja, precio_venta, stock, estatus);
        res.json({ mensaje: 'Variante actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la variante' });
    }
});

app.post('/cambiarEstadoVariante', async (req, res) => {
    try {
        const { pk_variante, estatus } = req.body;
        await query.cambiarEstadoVariante(pk_variante, estatus);
        res.json({ mensaje: 'Estado de la variante actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el estado de la variante' });
    }
});

//---------------------------------------------------------------------------------------------------

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});
