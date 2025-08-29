-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 22-05-2025 a las 15:11:29
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `ejemplo_banco`
--
CREATE DATABASE IF NOT EXISTS `ejemplo_banco` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ejemplo_banco`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `banco`
--

CREATE TABLE IF NOT EXISTS `banco` (
  `codigo` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `cod_transaccion` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`codigo`),
  UNIQUE KEY `cod_transaccion` (`cod_transaccion`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `banco`
--

INSERT INTO `banco` (`codigo`, `nombre`, `cod_transaccion`, `created_at`, `updated_at`) VALUES
(1, 'Banco Nacional', 'BNAC-001', '2025-05-08 15:04:21', '2025-05-08 15:04:21'),
(2, 'Banco Comercial', 'BCOM-002', '2025-05-08 15:04:21', '2025-05-08 15:04:21'),
(3, 'Banco de Ahorro', 'BAHO-003', '2025-05-08 15:04:21', '2025-05-08 15:04:21'),
(4, 'Banco Internacional', 'BINT-004', '2025-05-08 15:04:21', '2025-05-08 15:04:21'),
(5, 'Banco Rural', 'BRUR-005', '2025-05-08 15:04:21', '2025-05-08 15:04:21');

-- --------------------------------------------------------
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    rol ENUM('admin', 'editor', 'lector') NOT NULL DEFAULT 'lector',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Todos los usuarios tienen la contraseña hasheada con bcrypt
-- La contraseña en texto plano es 'password'

-- Administradores
INSERT INTO usuarios (username, password, nombre, email, rol) 
VALUES ('admin1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador Principal', 'admin1@example.com', 'admin');

INSERT INTO usuarios (username, password, nombre, email, rol) 
VALUES ('admin2', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador Secundario', 'admin2@example.com', 'admin');

-- Editores
INSERT INTO usuarios (username, password, nombre, email, rol) 
VALUES ('editor1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Editor Principal', 'editor1@example.com', 'editor');

INSERT INTO usuarios (username, password, nombre, email, rol) 
VALUES ('editor2', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Editor de Contenidos', 'editor2@example.com', 'editor');

-- Lectores
INSERT INTO usuarios (username, password, nombre, email, rol) 
VALUES ('lector1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lector Consultor', 'lector1@example.com', 'lector');

INSERT INTO usuarios (username, password, nombre, email, rol) 
VALUES ('lector2', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lector Básico', 'lector2@example.com', 'lector');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
