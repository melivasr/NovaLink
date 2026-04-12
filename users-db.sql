-- Database: users-db

-- DROP DATABASE IF EXISTS "users-db";

CREATE DATABASE "users-db"
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

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_skills (
    user_id     UUID NOT NULL REFERENCES users(id),
    product_id   UUID NOT NULL,
    acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, product_id)
);

INSERT INTO users (name, email, password_hash) VALUES
('Emilio',     'emilio@novalink.com',     '1234'),
('Estephanie', 'estephanie@novalink.com', '1234'),
('Gabriel',    'gabriel@novalink.com',    '1234'),
('Melisa',     'melisa@novalink.com',     '1234');