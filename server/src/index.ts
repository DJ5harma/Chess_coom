import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { dbConnect } from "./Database/dbConnect";
import { log } from "console";
import { r_user } from "./Routes/user/r_user";
import { redisConnect } from "./Redis/redis";
import { createServer } from "http";
import { Server } from "socket.io";
import { get_user_id } from "./Middleware/auth";
import { SocketIO } from "./Socket/SocketIO";

dotenv.config();

const { PORT, MONGO_URI } = process.env;

const app = express();
const server = createServer(app);
const io = new Server(server);
SocketIO.init(io);

if (!PORT || !MONGO_URI)
	console.error("atleast 1 environment variable is not accessible!");
else {
	app.use(cors());
	app.use(express.json());

	dbConnect(MONGO_URI).then(() => {
		redisConnect().then(() => {
			server.listen(PORT, () => {
				log(`Server running at http://localhost:${PORT}`);
			});
		});
	});

	app.get("/test", (_, res) => {
		res.json({ server: "is on", communication: "is working" });
	});

	app.use("/user", r_user);
}
