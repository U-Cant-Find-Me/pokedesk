import { WebSocketServer } from "ws";
import { NextResponse } from "next/server";

// In-memory room registry: roomCode -> Set of WebSocket clients
const rooms = new Map();

let wss = null;

function getOrCreateWSS() {
  if (wss) return wss;

  wss = new WebSocketServer({ noServer: true });

  wss.on("connection", (ws) => {
    let roomCode = null;

    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());

        // On first message (join), register the client in its room
        if (!roomCode && msg.roomCode) {
          roomCode = msg.roomCode;
          if (!rooms.has(roomCode)) {
            rooms.set(roomCode, new Set());
          }
          rooms.get(roomCode).add(ws);
          console.log(`[Relay] Client joined room: ${roomCode} (${rooms.get(roomCode).size} clients)`);
        }

        // Broadcast the raw message to all OTHER clients in the same room
        if (roomCode && rooms.has(roomCode)) {
          for (const client of rooms.get(roomCode)) {
            if (client !== ws && client.readyState === 1 /* OPEN */) {
              client.send(data.toString());
            }
          }
        }
      } catch (e) {
        console.warn("[Relay] Could not parse message:", e.message);
      }
    });

    ws.on("close", () => {
      if (roomCode && rooms.has(roomCode)) {
        rooms.get(roomCode).delete(ws);
        if (rooms.get(roomCode).size === 0) {
          rooms.delete(roomCode);
          console.log(`[Relay] Room empty, deleted: ${roomCode}`);
        } else {
          console.log(`[Relay] Client left room: ${roomCode} (${rooms.get(roomCode).size} remaining)`);
        }
      }
    });

    ws.on("error", (err) => {
      console.warn("[Relay] WebSocket error:", err.message);
    });
  });

  return wss;
}

// Next.js App Router requires this handler pattern for WebSocket upgrades
export function GET(request) {
  // Return a 426 Upgrade Required hint (browser WebSocket doesn't use this path directly)
  return new NextResponse("WebSocket Upgrade Required", { status: 426 });
}

// Export the WebSocket upgrader so the Next.js custom server can access it
export { getOrCreateWSS };
