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

io.on("connection", (socket) => {
  socket.on("join-board", (boardId) => {
    socket.join(boardId);
    console.log(`🔗 ${socket.id} joined board: ${boardId}`);

    // LINK EVENTS
    socket.on("add-link", ({ boardId, collectionId, link }) => {
      console.log(`Link added to collection ${collectionId} on board ${boardId}`);
      io.to(boardId).emit("link-added", { collectionId, link });
    });

    socket.on("update-link", ({ boardId, collectionId, link, fields }) => {
      io.to(boardId).emit("link-updated", {
        collectionId,
        linkId: link.id,
        fields,
      });
    });

    socket.on("delete-link", (data) => {
      io.to(data.boardId).emit("link-deleted", data);
    });

    // NOTE EVENTS
    socket.on("add-note", ({ boardId, collectionId, note }) => {
      console.log(`Note added to collection ${collectionId} on board ${boardId}`);
      io.to(boardId).emit("note-added", { collectionId, note });
    });

    socket.on("update-note", ({ boardId, collectionId, note, fields }) => {
      io.to(boardId).emit("note-updated", {
        boardId,
        collectionId,
        noteId: note.id,
        fields,
      });
    });

    socket.on("delete-note", (data) => {
      io.to(data.boardId).emit("note-deleted", data);
    });

    // FILE EVENTS
    socket.on("upload-file", ({ boardId, collectionId, file }) => {
      console.log(`📁 File uploaded to collection ${collectionId} on board ${boardId}`);
      io.to(boardId).emit("file-uploaded", { collectionId, file });
    });

    socket.on("delete-file", ({ boardId, collectionId, fileId }) => {
      io.to(boardId).emit("file-deleted", { collectionId, fileId });
    });
  });

  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on port ${PORT}`);
});
