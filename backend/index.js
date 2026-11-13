import express from "express";
import { configDotenv } from "dotenv";
import cors from "cors";
import connectDB from "./db/mongodb.js"; // Import database connection
import { createServer } from "node:http"; // Import for HTTP server
import { Server } from "socket.io"; // Import for Socket.IO
import { initVoteBatcher } from "./voteBatcher/voteBatcher.js"; // Import vote batcher init
import router from "./routes/polls.route.js"; // Import your API router
import redis from "./db/redis.js";
import { createAdapter } from "@socket.io/redis-adapter";
import os from "node:os"


configDotenv(); // Load environment variables

export const app = express(); 


const url = process.env.FRONTEND_URL || "http://localhost:5173"
console.log(url)
app.use(cors({
    origin : url,
    credentials : true
}));

app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors : {origin : url} // CORS for socket
});

// Redis adapter from Socket.io 
const pubClient = redis;
const subClient = pubClient.duplicate();
await subClient.connect();
io.adapter(createAdapter(pubClient, subClient));


app.set("io", io); 
initVoteBatcher(io);

io.on("connection", (socket) =>{
    console.log("Socket connected:", socket.id);
    socket.on("join-poll", (pollid) => socket.join(pollid));
    socket.on("disconnect", () => {console.log("Socket disconnected", socket.id)});
});


app.use("/api", router);

//testing stat
app.get('/stats', (req, res) => {
  res.json({
    instance: os.hostname(),
    connections: io.engine.clientsCount,
  });
});


const PORT = process.env.PORT || 3000; // Define your port
httpServer.listen(PORT, async () => {
    console.log("Server running on port :", PORT);
    await connectDB(); // Connect to MongoDB
});