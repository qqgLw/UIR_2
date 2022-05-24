const express = require('express');
const mysql = require('mysql2/promise');
const hirestime = require('hirestime')

'use strict';

// Параметры web-сервера
const server_port = '3000';
const server_host = 'localhost';

// Параметры подключения к MySQL
const conn = { host: 'localhost', port: 3305, database: 'lab5', user: 'lab5User', password : 'lab5Password' };

// Номер id для оценки времени
const test_id = 100;
const row_count = 100;

// Тестовые запросы
const queries = [
    { table: 'transactions_no_part', sql: `SELECT SQL_NO_CACHE * FROM transactions_no_part LIMIT ${row_count}` },
    // { table: 'transactions_no_part', sql: `SELECT SQL_NO_CACHE * FROM transactions_no_part ORDER BY id DESC LIMIT ${row_count}` },
    { table: 'transactions_no_part', sql: `SELECT SQL_NO_CACHE * FROM transactions_no_part WHERE id = ${test_id} LIMIT 1` },
    { table: 'transactions_part',    sql: `SELECT SQL_NO_CACHE * FROM transactions_part LIMIT ${row_count}` },
    // { table: 'transactions_part',    sql: `SELECT SQL_NO_CACHE * FROM transactions_part ORDER BY id DESC LIMIT ${row_count}` },
    { table: 'transactions_part',    sql: `SELECT SQL_NO_CACHE * FROM transactions_part WHERE id = ${test_id} LIMIT 1` },
];

async function run() {
    // Установить соединение с сервером
    const db = await mysql.createConnection(conn);

    // Создать web сервис
    const app = express();

    // Использовать pug (бывший jade) как HTML template движок
    app.set('view engine', 'pug');

    // По запросу http://server:port/ выполнить 4 тестовых выборки из двух таблиц
    app.get('/', wrapAsync(async (req, res, next) => {
        // Получить количество элементов в таблице (только для отчета)
        const [ rows ] = await db.execute(`SELECT COUNT(*) AS n FROM ${queries[0].table}`);
        const n = rows[0].n;

        // Выполнить тестовые выборки, накапливая результаты в массиве results
        let results = [];
        for (let i in queries) {
            let time = hirestime.hirestimeNode();
            let [ rows ] = await db.execute(queries[i].sql);
            let elapsed = time.ms().toFixed(2);

            results.push({
                n: n,
                sql: queries[i].sql,
                table: queries[i].table,
                time: elapsed,
            });
        }

        // Отобразить страницу результатов с помощью pug по шаблону results.pug
        res.render('results', { header: `Query results`, results: results });
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
