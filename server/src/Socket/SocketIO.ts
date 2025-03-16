import { get_user_id } from "../Middleware/auth";
import { u_user_ensure_cache } from "../Routes/user/utils/u_user_ensure_cache";
import { game_join_as_player } from "./io_game/game_join_as_player";
import { game_create } from "./io_game/game_create";
import { game_move } from "./io_game/game_move";

export class SocketIO {
	static io: io;
	static init(io: io) {
		this.io = io;

		io.on("connection", (socket: og_skt) => {
			socket.on("register-my-socket-id", async (auth_token: string) => {
				const user_id = get_user_id(auth_token);
				if (!user_id) return;
				if (!(await u_user_ensure_cache(user_id))) return;

				socket.join(user_id);
				console.log(user_id, "registered");

				socket.user_id = user_id;

				const skt = socket as skt;
				game_create(skt);
				game_join_as_player(skt);
				game_move(skt);
			});
		});
	}
}
