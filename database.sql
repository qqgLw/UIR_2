--
-- Скрипт создания базы данных с данными.
--

-- Удалить старую базу и аккаунт, если они существуют
DROP DATABASE IF EXISTS lab6;
DROP USER IF EXISTS lab6User;

-- Найстрока master-аккаунта
DROP USER IF EXISTS lab6User;
CREATE USER lab6User IDENTIFIED BY 'lab6Password';
GRANT ALL PRIVILEGES ON lab6.* TO lab6User;
GRANT REPLICATION SLAVE ON *.* TO lab6User;

-- Создать новую базу и аккаунт
CREATE DATABASE lab6;

-- Использовать созданную базу
USE lab6;

-- Создать таблицу без партицирования
CREATE TABLE IF NOT EXISTS `blogs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(32) NOT NULL DEFAULT "N/A",
    `posts_count` INT NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;