import { log } from "console";
import { DefaultEventsMap, Server, Socket } from "socket.io";
import { get_user_id } from "../Middleware/auth";
import { randomUUID } from "crypto";
import { redis, redis2 } from "../Redis/redis";
import { u_user_ensure_cache } from "../Routes/user/utils/u_user_ensure_cache";

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
			socket.on("register-my-socket-id", async (auth_token: string) => {
				const user_id = get_user_id(auth_token);
				if (!user_id) return;
				if (!(await u_user_ensure_cache(user_id))) return;

				socket.join(user_id);
				console.log(user_id, "registered");

				socket.user_id = user_id;

				const skt = socket as skt;
				SocketIO.game_create(skt);
				SocketIO.game_join_as_player(skt);
			});
		});
	}

	static game_create(skt: skt) {
		skt.on("game_create", () => {
			log("game create request");
			skt.emit("game_create_res", { game_id: randomUUID() });
		});
	}

	static game_join_as_player(skt: skt) {
		const user_id = skt.user_id;

		async function getOpp(opponent_uid: string) {
			return (await redis.HGETALL(`user:${opponent_uid}:data`)) as USER_DATA;
		}

		skt.on("game_join_as_player", async (game_id: string) => {
			//
			log("Join request");
			const [STR_GAME_SETUP, STR_GAME_JOIN] = [
				`game:${game_id}:setup`,
				`game:${game_id}:join`,
			];

			const game_setup_exists = await redis.EXISTS(STR_GAME_SETUP);

			console.log({ game_setup_exists });

			if (!game_setup_exists) {
				// Early joiner
				const am_i_white = [true, false][Math.floor(Math.random() * 2)];

				await redis.HSET(STR_GAME_SETUP, {
					moves_id: randomUUID(),
					white_uid: am_i_white ? user_id : "",
					black_uid: am_i_white ? "" : user_id,
				} as GAME_SETUP);

				redis.subscribe(STR_GAME_JOIN, (err, count) => {
					if (err) {
						console.error("Failed to subscribe: ", err);
					} else {
						console.log(`Subscribed to ${count} channel(s).`);
					}
				});

				redis.on("message", async (channel: string, opponent_uid: string) => {
					if (channel === STR_GAME_JOIN) {
						log("message came");
						await redis.HSET(
							STR_GAME_SETUP,
							am_i_white ? "black_uid" : "white_uid",
							opponent_uid
						);
						const opp = await getOpp(opponent_uid);
						//
						skt.emit("player_joined", { opp, am_i_white });
						redis.unsubscribe(STR_GAME_JOIN);
					}
				});
				//
			} else {
				const game_setup = (await redis.HGETALL(STR_GAME_SETUP)) as GAME_SETUP;

				const { black_uid, white_uid } = game_setup;
				console.log("exists", { black_uid, white_uid });
				if (
					(black_uid && black_uid === user_id) ||
					(white_uid && white_uid === user_id)
				) {
					log("user already joined");
					return;
				}

				// Late joiner

				const am_i_white = white_uid === "";

				log("is late joiner white: ", am_i_white);

				// await redis.HSET(
				// 	STR_GAME_SETUP,
				// 	am_i_white ? "white_uid" : "black_uid",
				// 	user_id
				// );

				log("subscribe message PUBLISH");
				await redis2.publish(STR_GAME_JOIN, user_id);

				const opponent_uid = black_uid ? black_uid : white_uid;
				const opp = await getOpp(opponent_uid);
				//
				skt.emit("player_joined", { opp, am_i_white });
			}
		});
	}
}
