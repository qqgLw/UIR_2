#!/usr/local/bin/node

const express = require('express');
const mysql = require('mysql2/promise');

'use strict';

// Параметры web-сервера
const server_host = 'localhost';
const server_port = '3001';

// Параметры подключения к MySQL
const conn = [
    { host: 'localhost', port: 3305, database: 'lab6', user: 'lab6User', password : 'lab6Password' },
    { host: 'localhost', port: 3310, database: 'lab6', user: 'lab6User', password : 'lab6Password' },
    { host: 'localhost', port: 3311, database: 'lab6', user: 'lab6User', password : 'lab6Password' },
    { host: 'localhost', port: 3312, database: 'lab6', user: 'lab6User', password : 'lab6Password' },
];

async function run() {
    // Установить соединение с серверами
    const master = await mysql.createConnection(conn[0]);
    const slave1 = await mysql.createConnection(conn[1]);
    const slave2 = await mysql.createConnection(conn[2]);
    const slave3 = await mysql.createConnection(conn[3]);

    // Создать web сервис
    const app = express();

    // Использовать pug (бывший jade) как HTML template движок
    app.set('view engine', 'pug');

    // По запросу http://server:port/ получить все записи из базы данных с серверов
    app.get('/', wrapAsync(async (req, res, next) => {
        // Выбрать записи
        let rows = [];
        [ rows[0] ] = await master.execute('SELECT * FROM blogs ORDER BY id');
        [ rows[1] ] = await slave1.execute('SELECT * FROM blogs ORDER BY id');
        [ rows[2] ] = await slave2.execute('SELECT * FROM blogs ORDER BY id');
        [ rows[3] ] = await slave3.execute('SELECT * FROM blogs ORDER BY id');


        // Отобразить страницу с помощью pug по шаблону slaves.pug
        res.render('slaves', {
            header: `Database content from all servers`,
            names: [ 'master', 'slave1', 'slave2', 'slave3' ],
            conn: conn,
            rows: rows,
        });
    }));

    // Запустить HTTP сервер
    app.listen(server_port, server_host, () => {
        console.log(`Slave reader running at http://${server_host}:${server_port}/, press Ctrl-C to exit`);
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
