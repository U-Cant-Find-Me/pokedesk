const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { WebSocketServer } = require("ws");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// In-memory room registry for WebSocket relay
const rooms = new Map();
const wss = new WebSocketServer({ noServer: true });

wss.on("connection", (ws) => {
  let roomCode = null;

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString());

      // On first message, register the client in its room
      if (!roomCode && msg.roomCode) {
        roomCode = msg.roomCode;
        if (!rooms.has(roomCode)) {
          rooms.set(roomCode, new Set());
        }
        rooms.get(roomCode).add(ws);
        console.log(`[Relay] Client joined room: ${roomCode} (${rooms.get(roomCode).size} clients in room)`);
      }

      // Broadcast to all OTHER clients in the same room (not sender)
      if (roomCode && rooms.has(roomCode)) {
        for (const client of rooms.get(roomCode)) {
          if (client !== ws && client.readyState === 1 /* OPEN */) {
            client.send(data.toString());
          }
        }
      }
    } catch (e) {
      console.warn("[Relay] Parse error:", e.message);
    }
  });

  ws.on("close", () => {
    if (roomCode && rooms.has(roomCode)) {
      rooms.get(roomCode).delete(ws);
      console.log(`[Relay] Client left room: ${roomCode} (${rooms.get(roomCode).size} remaining)`);
      if (rooms.get(roomCode).size === 0) {
        rooms.delete(roomCode);
      }
    }
  });

  ws.on("error", (err) => {
    console.warn("[Relay] WebSocket error:", err.message);
  });
});

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Intercept upgrade requests to /api/relay for WebSocket connections
  server.on("upgrade", (request, socket, head) => {
    const { pathname } = parse(request.url);
    if (pathname === "/api/relay") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else if (!dev && !pathname.startsWith('/_next')) {
      socket.destroy();
    }
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
