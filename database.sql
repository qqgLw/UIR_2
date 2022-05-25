--
-- Скрипт создания базы данных
--

-- Удалить старую базу и аккаунт, если они существуют
DROP DATABASE IF EXISTS lab7;
DROP USER IF EXISTS lab7User;

-- Создать новую базу и аккаунт
CREATE DATABASE lab7;
CREATE USER lab7User IDENTIFIED BY 'lab7Password';
GRANT ALL PRIVILEGES ON lab7.* TO lab7User;

-- Использовать созданную базу
USE lab7;


-- Создать таблицу
CREATE TABLE IF NOT EXISTS `blogs` (
    `id` INTEGER NOT NULL,
    `title` VARCHAR(32) NOT NULL,
    `posts_count` DOUBLE NOT NULL DEFAULT 0.0,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;


-- Создать процедуру для генерации случайных данных
DELIMITER //
CREATE PROCEDURE `generate_data` (IN start_id INT, IN items_count INT)
BEGIN
    DECLARE i INT DEFAULT start_id;
    WHILE i < start_id + items_count DO
        INSERT INTO `blogs` (`id`,`title`, `posts_count`)  VALUES (i,MD5(RAND()),RAND() * 1000);
        SET i = i + 1;
    END WHILE;
END//
DELIMITER ;