var app = require("express")(); // create function handler
var http = require("http").createServer(app); // create server, attach app to server
var io = require("socket.io")(http); // socket object to serve client sockets automatically

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

// stores all usernames
var userConnections = [];

// listens for client connections
io.on("connection", function(socket) {
  let connectionFrom = socket.handshake.query.name;
  let color = socket.handshake.query.color;
  if (connectionFrom !== undefined) {
    console.log("connection from " + connectionFrom);
    userConnections.push(connectionFrom);
    io.emit("user connection", {
      user: connectionFrom,
      userlist: userConnections,
      color: color
    });
  }

  // listens for client disconnections
  socket.on("disconnect", function() {
    let disconnectName = socket.handshake.query.name;
    let color = socket.handshake.query.color;
    console.log(disconnectName + " has disconnected.");
    var index = userConnections.indexOf(disconnectName);
    userConnections.splice(index, 1);
    io.emit("user disconnection", {
      user: disconnectName,
      color: color
    });
  });

  // listens for client messages
  socket.on("chat message", function(msg) {
    console.log("message from " + msg.sender + ": " + msg.body);

    // emit received message to all client sockets
    io.emit("chat message", {
      sender: msg.sender,
      body: msg.body,
      color: msg.color
    });
  });
});

http.listen(3000, function() {
  console.log("listening on *:3000");
});
