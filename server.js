const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 3000 });

console.log("Servidor encendido");

server.on('connection', (socket) => {

    console.log("Cliente conectado");

    socket.on('message', (msg) => {

        server.clients.forEach((client) => {

            if(client.readyState === WebSocket.OPEN){

                client.send(msg.toString());

            }

        });

    });

});