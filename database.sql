--
-- Скрипт создания базы данных с данными.
--

-- Удалить старую базу и аккаунт, если они существуют
DROP DATABASE IF EXISTS lab5;
DROP USER IF EXISTS lab5User;

-- Создать новую базу и аккаунт
CREATE DATABASE lab5;
CREATE USER lab5User IDENTIFIED BY 'lab5Password';
GRANT ALL PRIVILEGES ON lab5.* TO lab5User;

-- Использовать созданную базу
USE lab5;

-- Создать таблицу без партицирования
CREATE TABLE IF NOT EXISTS `blogs_no_part` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(32) NOT NULL,
    `posts_count` DOUBLE NOT NULL DEFAULT 0.0,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;

-- Создать таблицу с партицированием
CREATE TABLE IF NOT EXISTS `blogs_part` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(32) NOT NULL,
    `posts_count` DOUBLE NOT NULL DEFAULT 0.0,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  PARTITION BY KEY(`id`)
  PARTITIONS 10;


-- Создать процедуру для генерации случайных данных
DELIMITER //
CREATE PROCEDURE `generate_data` (IN items_count INT)
BEGIN
    DECLARE i INT DEFAULT 0;
    WHILE i < items_count DO
        INSERT INTO `blogs_no_part` (`title`, `posts_count`)  VALUES (MD5(RAND()),RAND() * 1000);
        SET i = i + 1;
    END WHILE;
    -- Скопировать те же данные в партицированную таблицу
    INSERT INTO `blogs_part`
        SELECT * FROM `blogs_no_part`;
END//
DELIMITER ;

-- Заполнить таблицу данными
CALL generate_data(100000);

-- Удалить процедуру
DROP PROCEDURE `generate_data`;
