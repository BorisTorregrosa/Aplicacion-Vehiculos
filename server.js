const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;
const server = new WebSocket.Server({ port: PORT });

console.log("Servidor encendido en puerto", PORT);

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

            }

        });

    });

});
