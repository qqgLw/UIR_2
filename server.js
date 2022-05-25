const express = require('express');
const mysql = require('mysql2/promise');

'use strict';

// Параметры web-сервера
const server_host = 'localhost';
const server_port = '3000';

// Количество серверов и максимальное количество записей на сервере согласно варианту
n_servers = 4
n_records = 5;

// Имена серверов для отображения
const server_names = [ 'server1', 'server2', 'server3', 'server4' ];

// Параметры подключения к MySQL
const conn = [
    { host: 'localhost', port: 3301, database: 'lab7', user: 'lab7User', password : 'lab7Password' },
    { host: 'localhost', port: 3302, database: 'lab7', user: 'lab7User', password : 'lab7Password' },
    { host: 'localhost', port: 3303, database: 'lab7', user: 'lab7User', password : 'lab7Password' },
    { host: 'localhost', port: 3304, database: 'lab7', user: 'lab7User', password : 'lab7Password' },
];

async function run() {
    // Установить соединение с серверами
    let db = [];
    for (let i = 0; i < conn.length; i++) {
        db[i] = await mysql.createConnection(conn[i]);
    }

    // Создать web сервис
    const app = express();

    // Использовать pug (бывший jade) как HTML template движок
    app.set('view engine', 'pug');

    // По запросу http://server:port/ получить все записи из базы данных с серверов
    app.get('/', wrapAsync(async (req, res, next) => {
        // Показать все записи
        let rows = [];
        for (let i = 0; i < db.length; i++) {
            [ rows[i] ] = await db[i].execute('SELECT * FROM blogs ORDER BY id');
        }

        // Отобразить страницу с помощью pug по шаблону index.pug
        res.render('index', {
            header: `Database content from all servers`,
            names: server_names,
            conn: conn,
            rows: rows,
        });
    }));

    // По запросу http://server:port/id/<id> получить нужную запись с соответствующего сервера
    app.get('/id/:id', wrapAsync(async (req, res, next) => {
        // Получить id из запроса
        let id = req.params.id;
        let max_id = n_servers * n_records - 1;

        // Вернуть ошибку, если вне допустимого диапазона
        if ((id < 0) || (id > max_id)) {
            res.render('record', {
                header: `Record ${id} is out of range`,
                msg: `Valid range is ${0}..${max_id}`,
                rows: [],
            });
            return;
        }

        // Найти номер сервера по id записи
        let server_id = Math.floor(id / n_records);

        // Использовать соответствующее подключение для выборки записи
        const [ rows ] = await db[server_id].execute('SELECT * FROM blogs WHERE id = ?', [ id ]);

        // Отобразить страницу с помощью pug по шаблону record.pug
        if (rows.length) {
            res.render('record', {
                header: `Record ${id} was found on ${server_names[server_id]}`,
                rows: rows,
            });
        } else {
            res.render('record', {
                header: `Record ${id} is expected to be on ${server_names[server_id]}, but was not found`,
                rows: rows,
            });
        }
    }));

    // Запустить HTTP сервер
    app.listen(server_port, server_host, () => {
        console.log(`Server running at http://${server_host}:${server_port}/, press Ctrl-C to exit`);
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
