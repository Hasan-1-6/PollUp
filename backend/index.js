import express from "express";
import { configDotenv } from "dotenv";
import cors from "cors";
import connectDB from "./db/mongodb.js"; // Import database connection
import { createServer } from "node:http"; // Import for HTTP server
import { Server } from "socket.io"; // Import for Socket.IO
import router from "./routes/polls.route.js"; // Import your API router


configDotenv(); // Load environment variables

const app = express(); 


const url = process.env.NODE_ENV === "production" ? "https://poll-up-lime.vercel.app" : "http://localhost:5173"
console.log(url)
app.use(cors({
    origin : url,
    credentials : true
}));

app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors : {origin : "url"} // CORS for socket
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
