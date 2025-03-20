import { get_user_id } from "../Middleware/auth";
import { game_join_as_player } from "./io_game/game_join_as_player";
import { game_move } from "./io_game/game_move";
import { UTILS } from "../Misc/UTILS";
import { type DefaultEventsMap, type Server } from "socket.io";

type io = Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

export class SocketIO {
	static io: io;
	static init(io: io) {
		this.io = io;

		io.on("connection", (socket: og_skt) => {
			socket.on("register-my-socket-id", async (auth_token: string) => {
				const user_id = get_user_id(auth_token);
				if (!user_id) return;
				if (!(await UTILS.is_user_cache_ensured(user_id))) return;

				console.log(user_id, "registered");

				socket.user_id = user_id;

				const skt = socket as skt;
				game_join_as_player(skt);
				game_move(skt);
			});
		});
	}
}
