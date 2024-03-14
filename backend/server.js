import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";

import authRoutes from "./routes/auth.route.js";
import chatRoutes from "./routes/chat.route.js";
import messageRoutes from "./routes/message.route.js";
import userRoutes from "./routes/user.route.js";

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

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  connectToMongoDB();
  console.log(`Server Running on port ${PORT}`);
});
