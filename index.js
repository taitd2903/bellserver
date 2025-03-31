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

let bellData = []; // Lưu danh sách người bấm chuông
let bellStartTime = null; // Lưu thời gian bắt đầu game

io.on("connection", (socket) => {
  console.log("⚡ Một người dùng đã kết nối:", socket.id);

  // Gửi dữ liệu hiện tại khi người dùng kết nối
  socket.emit("updateBellData", bellData);
  if (bellStartTime) {
    socket.emit("startGame", bellStartTime); // Gửi thời gian bắt đầu nếu game đang chạy
  }

  // Khi admin bắt đầu game
  socket.on("startGame", () => {
    bellStartTime = Date.now();
    bellData = []; // Reset danh sách bấm chuông
    io.emit("startGame", bellStartTime); // Gửi sự kiện cho tất cả client
    io.emit("updateBellData", bellData); // Reset danh sách trên client
    console.log("🚀 Admin đã bắt đầu trò chơi!");
  });

  // Khi người dùng bấm chuông
  socket.on("ringBell", (data) => {
    if (!bellStartTime || (Date.now() - bellStartTime) / 1000 > 30) {
      console.log("⏳ Hết thời gian bấm chuông, bỏ qua:", data.name);
      return; // Hết thời gian bấm chuông
    }

    bellData.push(data);
    io.emit("updateBellData", bellData); // Cập nhật danh sách người chơi bấm chuông
    console.log("🔔 Chuông rung:", data.name);
  });

  // Khi admin reset danh sách chuông
  socket.on("resetBell", () => {
    bellData = [];
    bellStartTime = null;
    io.emit("resetBell");
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

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server chạy trên http://localhost:${PORT}`);
});
