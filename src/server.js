'use strict';

const Hapi = require('hapi');
const server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: __dirname
            }
        }
    }
});
server.connection({ port: 3000 });

//const rpio = require('rpio');
const defaultPinOnDuration = 500;

// Raspberry Pi Model B (P1 Header) schematic: http://pi4j.com/images/p1header-large.png
const relayToGpioPinMapping = {
    '1': 11,
    '2': 12
};

const relayStatus = {};

server.register(require('inert'), (err) => {

    if (err) {
        throw err;
    }

    // Static routes
    server.route({ method: 'GET', path: '/', handler: { file: 'index.html' } });
    server.route({ method: 'GET', path: '/fetch.js', handler: { file: 'node_modules/whatwg-fetch/fetch.js' } } );

    // REST endpoint routes

    // Get Status
    server.route({ method: 'GET', path: '/relay/{number}/status',
        handler: function (request, reply) {
            let relayNumber = request.params.number;
            reply({
                status: relayStatus[relayNumber]
            });
        }
    });

    // Set Status
    server.route({ method: 'PUT', path: '/relay/{number}/status',
        handler: function (request, reply) {
            let relayNumber = request.params.number;
            let status = request.payload.status;
            relayStatus[relayNumber] = status;
            reply().code(200);
        }
    });

    // Command
    // Test: curl -X PUT -D - -H "Content-Type: application/json" http://localhost:3000/relay/1/command/on
    server.route({ method: 'POST', path: '/relay/{number}/command/{command}',
        handler: function (request, reply) {
            let relayNumber = request.params.number;
            let command = request.params.command;
            if (['toggle', 'on', 'off'].indexOf(command) >= 0) {
                console.log(`Running command: Relay (${relayNumber}) [${command}]`);
                let relayPin = relayToGpioPinMapping[relayNumber];
                toggleGpioPinOn(relayPin, defaultPinOnDuration);
                relayStatus[relayNumber] = !relayStatus[relayNumber];
                reply({
                    status: relayStatus[relayNumber]
                }).code(200);
            } else {
                reply().code(501);
            }
        }
    });

    // Start hapi.js HTTP server
    server.start((err) => {
        if (err) {
            throw err;
        }
        console.log(`Server running at: ${server.connections.map((c)=> { return c.info.port; }).toString()}`);
    });
});

// Broadcast API metadata to UDP socket for discovery by other devices
const dgram = require('dgram');
const broadcastSocket = dgram.createSocket("udp4");
const broadcastPort = 41234;
const broadcastAddress = "255.255.255.255";
const broadcastMessage = JSON.stringify({
    source: "{{hostname}} relay API",
    endpoint: "relays/{relayNumber}",
    endpointMethod: "PUT",
    availableRelays: [1,2],
    availableStates: ["triggered"]
});
const broadcastIntervalMilliseconds = 60000;
broadcastSocket.bind(() => {
    broadcastSocket.setBroadcast(true);
    setInterval(function (socket) {
        console.log(`Broadcasting API metadata to: ${broadcastAddress}:${broadcastPort}`);
        broadcastSocket.send(broadcastMessage, broadcastPort, broadcastAddress);
    }, broadcastIntervalMilliseconds);
});

function toggleGpioPinOn(pin, durationMilliseconds) {
    // Set the initial state to low.
    // rpio.open(pin, rpio.OUTPUT, rpio.LOW);
    // // Turn pin ON.
    // rpio.write(pin, rpio.HIGH);
    // // Wait durationMilliseconds
    // rpio.msleep(durationMilliseconds);
    // // Turn pin OFF.
    // rpio.write(pin, rpio.LOW);
}

// On startup, turn all the pins off.
for(let relay of Object.keys(relayToGpioPinMapping)) {
    let pin = relayToGpioPinMapping[relay];
    // Set the initial state to low.
    // rpio.open(pin, rpio.OUTPUT, rpio.LOW);
    // // Turn pin OFF.
    // rpio.write(pin, rpio.LOW);
    relayStatus[relay] = false;
}