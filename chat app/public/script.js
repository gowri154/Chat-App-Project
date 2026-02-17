let ws;
let currentRoom = "";

function login() {
  const username = document.getElementById("username").value;

  ws = new WebSocket("ws://localhost:8080");

  ws.onopen = () => {
    ws.send(JSON.stringify({
      type: "login",
      username: username
    }));
  };

  ws.onmessage = event => {
    const data = JSON.parse(event.data);

    if (data.type === "login-success") {
      document.getElementById("login").classList.add("hidden");
      document.getElementById("chat").classList.remove("hidden");
      updateRooms(data.rooms);
    }

    if (data.type === "rooms") {
      updateRooms(data.rooms);
    }

    if (data.type === "message") {
      addMessage(`${data.time} <b>${data.username}:</b> ${data.text}`);
    }

    if (data.type === "notification") {
      addMessage(`<i>${data.message}</i>`);
    }

    if (data.type === "error") {
      alert(data.message);
    }
  };
}

function updateRooms(rooms) {
  const roomList = document.getElementById("roomList");
  roomList.innerHTML = "";

  rooms.forEach(room => {
    const li = document.createElement("li");
    li.innerText = room;
    li.onclick = () => joinRoom(room);
    roomList.appendChild(li);
  });
}

function createRoom() {
  const room = document.getElementById("newRoom").value;
  ws.send(JSON.stringify({
    type: "create-room",
    room: room
  }));
}

function joinRoom(room) {
  currentRoom = room;
  ws.send(JSON.stringify({
    type: "join-room",
    room: room
  }));
  document.getElementById("messages").innerHTML = "";
}

function sendMessage() {
  const msg = document.getElementById("messageInput").value;
  if (msg.trim() === "") return;

  ws.send(JSON.stringify({
    type: "message",
    text: msg
  }));

  document.getElementById("messageInput").value = "";
}

function addMessage(text) {
  const div = document.createElement("div");
  div.className = "message";
  div.innerHTML = text;

  const messages = document.getElementById("messages");
  messages.appendChild(div);

  // Smooth auto scroll
  messages.scrollTo({
    top: messages.scrollHeight,
    behavior: "smooth"
  });
}
