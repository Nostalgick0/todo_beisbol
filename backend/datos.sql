set names utf8mb4;
use todo_beisbol;

insert into categorias (nom_categoria) values ('Guantes'), ('Bates');

insert into subcategorias (nom_subcategoria, fk_categoria) values
('De bateo', 1), ('De campo', 1), ('De aluminio', 2);

insert into productos (nom_prod, marca, fk_categoria, fk_subcategoria) values
('Guante de bateo', 'Franklin', 1, 1),
('Pelota de sóftbol', 'Wilson', 1, 2),
('Bate de aluminio', 'Easton', 2, 3);

insert into variantes (fk_producto, estilo, talla, color, tipo_publico, tipo_caja, precio_venta, stock) values
(1, 'Cuero', '12"', 'Negro', 'Adulto', null, 899.00, 1),
(1, 'Cuero', '11"', 'Café', 'Adulto', null, 849.00, 4),
(1, 'Sintético', '10"', 'Negro', 'Juvenil', null, 599.00, 6),
(2, 'Oficial', '12"', 'Blanco', 'Adulto', 'Caja 12', 189.00, 1),
(3, 'Aluminio', '32"', 'Azul', 'Adulto', null, 2499.00, 3),
(3, 'Aluminio', '30"', 'Negro', 'Juvenil', null, 2199.00, 2);

insert into usuarios (nom_usuario, password, rol) values ('admin', '1234', 1);
