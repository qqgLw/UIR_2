#!/usr/local/bin/node

const express = require('express');
const mysql = require('mysql2/promise');

'use strict';

// Параметры web-сервера
const server_host = 'localhost';
const server_port = '3000';

// Параметры подключения к MySQL master
const conn = { host: 'localhost', port: 3305, database: 'lab6', user: 'lab6User', password : 'lab6Password' };

async function run() {
    // Установить соединение с сервером
    const master = await mysql.createConnection(conn);

    // Создать web сервис
    const app = express();

    // Использовать pug (бывший jade) как HTML template движок
    app.set('view engine', 'pug');

    // По запросу http://server:port/ добавить новую запись в базу master
    app.get('/', wrapAsync(async (req, res, next) => {
        // Создать запись со случайным параметром posts_count
        let  posts_count = (Math.random() * 1000).toFixed(0);
        await master.execute('INSERT INTO blogs SET posts_count = ?', [ posts_count ]);

        // Отобразить страницу с помощью pug по шаблону master.pug
        res.render('master', {
            header: `Writer to master at ${conn.host}:${conn.port}`,
            text: `New entry has been added to the master database with the following posts_count of N/A blog: ${posts_count}`,
        });
    }));

    // Запустить HTTP сервер
    app.listen(server_port, server_host, () => {
        console.log(`Master writer running at http://${server_host}:${server_port}/, press Ctrl-C to exit`);
    });
}

// Вспомогательная функция для обработки возможных ошибок в асинхронных функциях.
// Переназначает exceptions на стандартный обработчик ошибок Express.
function wrapAsync(fn) {
    return function(req, res, next) {
        fn(req, res, next).catch(next);
    };
}

run();
