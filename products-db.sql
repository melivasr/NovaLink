-- Database: products-db

-- DROP DATABASE IF EXISTS "products-db";

CREATE DATABASE "products-db"
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Spanish_Spain.1252'
    LC_CTYPE = 'Spanish_Spain.1252'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE difficulty_level AS ENUM ('Facil', 'Medio', 'Dificil');


CREATE TABLE products (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) NOT NULL UNIQUE,
    difficulty  difficulty_level NOT NULL,
    xp_points   INT NOT NULL CHECK (xp_points >= 1 AND xp_points <= 10),
    stock       INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO products (name, difficulty, xp_points, stock) VALUES
('Empatía',               'Facil',   3, 100),
('Amistad',               'Facil',   2, 100),
('Escucha Activa',        'Facil',   3, 100),
('Respeto',               'Facil',   2, 100),
('Humor',                 'Facil',   1, 100),
('Comunicación Asertiva', 'Medio',   5, 80),
('Colaboración',          'Medio',   5, 80),
('Paciencia',             'Medio',   6, 80),
('Confianza',             'Medio',   5, 80),
('Adaptabilidad',         'Medio',   6, 80),
('Liderazgo',             'Dificil', 8, 50),
('Resiliencia',           'Dificil', 9, 50),
('Sagacidad',             'Dificil', 8, 50),
('Creatividad',           'Dificil', 7, 50),
('Iniciativa',            'Dificil', 7, 50);