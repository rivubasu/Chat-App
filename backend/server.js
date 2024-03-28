import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";

import authRoutes from "./routes/auth.route.js";
import chatRoutes from "./routes/chat.route.js";
import messageRoutes from "./routes/message.route.js";
import userRoutes from "./routes/user.route.js";

import path from "path";
import { Server } from "socket.io";
import connectToMongoDB from "./db/connnectToMongoDB.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const app = express();
const PORT = process.env.PORT || 5000;

dotenv.config();

app.use(express.json()); //to parse incoming request from jason payload (from req.body)
app.use(cookieParser()); // to get cookies from req.cookie.jwt, used for authentication

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/users", userRoutes);
app.use("/api/message", messageRoutes);

// --------------------------deployment------------------------------

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// --------------------------deployment------------------------------

app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  //similarly  we can use create server
  connectToMongoDB();
  console.log(`Server Running on port ${PORT}`);
});

const io = new Server(server, {
  pingTimeout: 60000, //it will close the connection after  60 secs  of inactivity from client side
  cors: {
    //origin: "http://localhost:3000",
    origin: "*",
    // credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id); //created a room for  each user with his _id
    //console.log("userData = ", userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room); //allowing user to join any specific room
    console.log(`User joined room ${room}`);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id === newMessageRecieved.sender._id) return; //don't send back the message which is sent by the sender himself

      socket.in(user._id).emit("message recieved", newMessageRecieved); //sending data to that particular user who is connected to this room
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
