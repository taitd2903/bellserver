const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

let bellData = []; // Lưu dữ liệu chuông

io.on("connection", (socket) => {
  console.log("⚡ Một người dùng đã kết nối:", socket.id);

  socket.emit("updateBellData", bellData);

  socket.on("ringBell", (data) => {
    bellData.push(data);
    io.emit("updateBellData", bellData);
    console.log("🔔 Chuông rung:", data);
  });

  socket.on("resetBell", () => {
    bellData = [];
    io.emit("updateBellData", bellData);
    console.log("🔄 Admin đã reset danh sách");
  });

  socket.on("disconnect", () => {
    console.log("❌ Người dùng đã ngắt kết nối:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("🚀 Server chạy thành công!");
});

// Sử dụng PORT từ môi trường (Render sẽ cấp), fallback về 4000
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server chạy trên http://localhost:${PORT}`);
});
