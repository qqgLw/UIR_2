
'use strict';

const express = require('express');

const server_port = '3000';
const server_host = '127.0.0.1';

const app = express();

app.set('view engine', 'pug');
app.get('/', (req, res, next) => {
    let data = [
        [ 1, 'Item 1' ],
        [ 2, 'Item 2' ],
        [ 3, 'Item 3' ],
    ];
    res.render('index', {
        header: 'Example Express web server using Pug template engine',
        text: 'The table below is shown using data from JavaScript array:',
        table: data,
    })
});
app.listen(server_port, server_host, () => {
    console.log(`Server running at http://${server_host}:${server_port}/, press Ctrl-C to exit`);
});
