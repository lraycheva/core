const express = require("express");
const http = require("http");
// const WebSocket = require("ws");
const cors = require("cors");
const bodyParser = require("body-parser");
const { handleHttpCommand } = require("./controller");

// const sockets = [];

const app = express();

const server = http.createServer(app);

// const wss = new WebSocket.Server({ server });

const PORT = 9997;

app.use(cors());

app.use(bodyParser.json());

app.get("/", (_, res) => {
    res.json({ message: "OK" });
});

app.post("/command", (req, res) => {
    const body = req.body;

    handleHttpCommand(body.command, body.data)
        .then((result) => res.json(result))
        .catch((error) => res.status(400).send({errMsg: typeof error === "string" ? error : JSON.stringify(error.message)}));
});

// wss.on("connection", (ws) => {

//     ws.on("message", (message) => {

//         const parsedMessage = JSON.parse(message);

//         if (parsedMessage.gtf) {
//             sockets.push({ id: "runner", socket: ws });
//             return;
//         }

//         // handle other messages
//     });
// });

server.listen(PORT, () => console.log(`The Puppet Bridge is running on port ${PORT}.`));