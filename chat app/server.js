const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

let users = {};
let rooms = {};

wss.on("connection", ws => {

  ws.on("message", data => {
    const msg = JSON.parse(data);

    // LOGIN
    if (msg.type === "login") {
      if (users[msg.username]) {
        ws.send(JSON.stringify({
          type: "error",
          message: "Username already exists"
        }));
        return;
      }

      users[msg.username] = ws;
      ws.username = msg.username;

      ws.send(JSON.stringify({
        type: "login-success",
        rooms: Object.keys(rooms)
      }));
    }

    // CREATE ROOM
    if (msg.type === "create-room") {
      if (!rooms[msg.room]) {
        rooms[msg.room] = [];
      }
      broadcastRooms();
    }

    // JOIN ROOM
    if (msg.type === "join-room") {
      ws.room = msg.room;
      rooms[msg.room].push(ws.username);

      broadcastToRoom(msg.room, {
        type: "notification",
        message: `${ws.username} joined the room`
      });
    }

    // SEND MESSAGE
    if (msg.type === "message") {
      broadcastToRoom(ws.room, {
        type: "message",
        username: ws.username,
        text: msg.text,
        time: new Date().toLocaleTimeString()
      });
    }
  });

  ws.on("close", () => {
    delete users[ws.username];

    if (ws.room && rooms[ws.room]) {
      rooms[ws.room] = rooms[ws.room].filter(u => u !== ws.username);

      broadcastToRoom(ws.room, {
        type: "notification",
        message: `${ws.username} left the room`
      });
    }
  });
});

function broadcastRooms() {
  const roomList = Object.keys(rooms);
  wss.clients.forEach(client => {
    client.send(JSON.stringify({
      type: "rooms",
      rooms: roomList
    }));
  });
}

function broadcastToRoom(room, message) {
  wss.clients.forEach(client => {
    if (client.room === room) {
      client.send(JSON.stringify(message));
    }
  });
}

console.log("Server running on ws://localhost:8080");
