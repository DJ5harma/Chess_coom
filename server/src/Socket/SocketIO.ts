import { log } from "console";
import { DefaultEventsMap, Server, Socket } from "socket.io";
import { get_user_id } from "../Middleware/auth";
import { randomUUID } from "crypto";
import { redis } from "../Redis/redis";

type io = Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

interface og_skt
	extends Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> {
	user_id?: string;
}

interface skt extends og_skt {
	user_id: string;
}

export class SocketIO {
	static io: io;
	static init(io: io) {
		this.io = io;

		io.on("connection", (socket: og_skt) => {
			log(socket.id, "connected");

			socket.on("register-my-socket-id", (auth_token: string) => {
				const user_id = get_user_id(auth_token);
				if (!user_id) return;
				socket.join(user_id);

				socket.user_id = user_id;
				const skt = socket as skt;

				SocketIO.game_create(skt);
			});
		});
	}

	static game_create(skt: skt) {
		skt.on("game_create", () => {
			skt.emit("game_create_res", { game_id: randomUUID() });
		});
	}

	static game_join_as_player(skt: skt) {
		const { user_id, emit, on } = skt;

		async function getOpp(opponent_uid: string) {
			return (await redis.HGETALL(`user:${opponent_uid}:data`)) as USER_DATA;
		}

		on("game_join_as_player", async (game_id: string) => {
			//
			const [STR_GAME_SETUP, STR_GAME_JOIN] = [
				`game:${game_id}:setup`,
				`game:${game_id}:join`,
			];

			let game_setup = (await redis.HGETALL(STR_GAME_SETUP)) as GAME_SETUP;

			if (!game_setup) {
				// Early joiner
				const am_i_white = [true, false][Math.floor(Math.random() * 2)];

				await redis.HSET(STR_GAME_SETUP, {
					moves_id: randomUUID(),
					white_uid: am_i_white ? user_id : "",
					black_uid: am_i_white ? "" : user_id,
				} as GAME_SETUP);

				await redis.SUBSCRIBE(STR_GAME_JOIN, async (opponent_uid: string) => {
					await redis.HSET(
						STR_GAME_SETUP,
						am_i_white ? "black_uid" : "white_uid",
						opponent_uid
					);

					const opp = await getOpp(opponent_uid);

					await redis.UNSUBSCRIBE(STR_GAME_JOIN);
					//
					emit("player_joined", { opp, am_i_white });
				});
				//
			} else {
				const { black_uid, white_uid } = game_setup;
				if (
					// unauthorized user tried to join
					black_uid &&
					black_uid !== user_id &&
					white_uid &&
					white_uid !== user_id
				)
					return;

				// Late joiner

				const am_i_white = white_uid !== "";

				await redis.PUBLISH(STR_GAME_JOIN, user_id);

				const opponent_uid = black_uid ? black_uid : white_uid;
				const opp = await getOpp(opponent_uid);
				//
				emit("player_joined", { opp, am_i_white });
			}
		});
	}
}
