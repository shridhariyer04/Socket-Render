import express from "express";
import * as http from "http";
import { Server } from "socket.io";
import * as dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT) || 4000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGIN,
    methods: ["GET", "POST"],
  },
});

// Types
interface LinkPayload {
  boardId: string;
  collectionId: string;
  link: {
    id: string;
    title: string;
    url: string;
    createdAt?: string;
  };
}

interface UpdateLinkPayload extends LinkPayload {
  fields: Partial<{
    title: string;
    url: string;
  }>;
}

// Socket Handling
io.on("connection", (socket) => {
  console.log("🟢 Connected:", socket.id);

  socket.on("join-board", (boardId: string) => {
    socket.join(boardId);
    console.log(`🔗 ${socket.id} joined board: ${boardId}`);

    socket.on("add-link", (data: LinkPayload) => {
      const { boardId, collectionId, link } = data;
      console.log(`📌 Link added to collection ${collectionId} on board ${boardId}`);
      io.to(boardId).emit("link-added", { collectionId, link });
    });

    socket.on("update-link", (data: UpdateLinkPayload) => {
      const { boardId, collectionId, link, fields } = data;
      io.to(boardId).emit("link-updated", {
        collectionId,
        linkId: link.id,
        fields,
      });
    });

    socket.on("delete-link", (data: { boardId: string; collectionId: string; linkId: string }) => {
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
