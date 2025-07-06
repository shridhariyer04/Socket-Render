import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT) || 4000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGIN,
    methods: ["GET", "POST"],
  },
});

// Socket Handling
io.on("connection", (socket) => {
  console.log("🟢 Connected:", socket.id);

  socket.on("join-board", (boardId) => {
    socket.join(boardId);
    console.log(`🔗 ${socket.id} joined board: ${boardId}`);

    socket.on("add-link", (data) => {
      const { boardId, collectionId, link } = data;
      console.log(`📌 Link added to collection ${collectionId} on board ${boardId}`);
      io.to(boardId).emit("link-added", { collectionId, link });
    });

    socket.on("update-link", (data) => {
      const { boardId, collectionId, link, fields } = data;
      io.to(boardId).emit("link-updated", {
        collectionId,
        linkId: link.id,
        fields,
      });
    });

    socket.on("delete-link", (data) => {
      io.to(data.boardId).emit("link-deleted", data);
    });
  });

  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on port ${PORT}`);
});