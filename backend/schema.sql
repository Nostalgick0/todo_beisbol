create database todo_beisbol;
use todo_beisbol;

create table categorias (
  pk_categoria int primary key auto_increment,
  nom_categoria varchar(40) not null,
  estatus int not null default 1
);

create table subcategorias (
  pk_subcategoria int primary key auto_increment,
  nom_subcategoria varchar(40) not null,
  fk_categoria int not null,
  estatus int not null default 1,
  foreign key (fk_categoria) references categorias(pk_categoria)
);

create table productos (
  pk_prod int primary key auto_increment,
  nom_prod varchar(40) not null,
  marca varchar(30) not null,
  fk_categoria int not null,
  fk_subcategoria int,
  estatus int not null default 1,
  foreign key (fk_categoria) references categorias(pk_categoria),
  foreign key (fk_subcategoria) references subcategorias(pk_subcategoria)
);

create table variantes (
  pk_variante int primary key auto_increment,
  fk_producto int not null,
  estilo varchar(20) not null,
  talla varchar(20) not null,
  color varchar(20) not null,
  tipo_publico varchar(10) not null,
  tipo_caja varchar(20),
  precio_venta decimal(10,2) not null,
  stock int not null default 0,
  estatus int not null default 1,
  foreign key (fk_producto) references productos(pk_prod)
);

create table usuarios (
  pk_usuario int primary key auto_increment,
  nom_usuario varchar(40) not null,
  password varchar(100) not null,
  rol int not null,
  estatus int not null default 1
);
