//Base NodeJS Server Example:
'use strict';

const http = require('http');
const server_host = '127.0.0.1';
const server_port = '3000';

http.createServer((req, res) => {
    let data = "Hello world";
    res.writeHead(200, {
        'Content-Type': 'text/html',
        'Content-Length': data.length,
    });
    res.write(data);
    res.end();
}).listen(server_port, server_host);

console.log(`Server running at http://${server_host}:${server_port}/, press Ctrl-C to exit`);
