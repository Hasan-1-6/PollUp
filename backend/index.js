import express from "express";
import { configDotenv } from "dotenv";
import cors from "cors";
import connectDB from "./db/mongodb.js"; // Import database connection
import { createServer } from "node:http"; // Import for HTTP server
import { Server } from "socket.io"; // Import for Socket.IO
import router from "./routes/polls.route.js"; // Import your API router


configDotenv(); // Load environment variables

const app = express(); 


app.use(cors({
    origin : "http://localhost:5173",
    credentials : true
}));

app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors : {origin : "http://localhost:5173"} // CORS origin
});

app.set("io", io); 

io.on("connection", (socket) =>{
    console.log("Socket connected:", socket.id);
    socket.on("join-poll", (pollid) => socket.join(pollid));
    socket.on("disconnect", () => {console.log("Socket disconnected", socket.id)});
});


app.use("/api", router); 


const PORT = 3000; // Define your port
httpServer.listen(PORT, async () => {
    console.log("Server running on port :", PORT);
    await connectDB(); // Connect to MongoDB
});
