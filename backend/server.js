import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";

import connectToMongoDB from "../db/connnectToMongoDB.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

const app = express();
const PORT = process.env.PORT || 5000;

dotenv.config();

app.use(express.json()); //to parse incoming request from jason payload (from req.body)
app.use(cookieParser()); // to get cookies from req.cookie.jwt, used for authentication

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// app.get("/", (req, res) => {
//   //root route http://localhost:5000/
//   res.send("Hello World!!");
// });

app.listen(PORT, () => {
  connectToMongoDB();
  console.log(`Server Running on port ${PORT}`);
});
