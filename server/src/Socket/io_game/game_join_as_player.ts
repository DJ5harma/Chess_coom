import { log } from "console";
import { redis, subscriber } from "../../Redis/redis";
import { randomUUID } from "crypto";
import { Utils } from "../../Utils";

export function game_join_as_player(skt: skt) {
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

		let moves_id: string;

		if (!game_setup_exists) {
			// Early joiner
			const am_i_white = [true, false][Math.floor(Math.random() * 2)];
			moves_id = randomUUID();

			await redis.HSET(STR_GAME_SETUP, {
				moves_id,
				white_uid: am_i_white ? user_id : "",
				black_uid: am_i_white ? "" : user_id,
			} as GAME_SETUP);

			await subscriber.subscribe(
				STR_GAME_JOIN,
				async (opponent_uid: string) => {
					await redis.HSET(
						STR_GAME_SETUP,
						am_i_white ? "black_uid" : "white_uid",
						opponent_uid
					);
					const opp = await getOpp(opponent_uid);
					log("message came", { opp });
					//

					const game_token = Utils.generate_game_token({
						am_i_white,
						moves_id,
					});

					skt.emit("player_joined", { opp, am_i_white, game_token });
					subscriber.unsubscribe(STR_GAME_JOIN);
				}
			);
		} else {
			// Late joiner
			const game_setup = (await redis.HGETALL(STR_GAME_SETUP)) as GAME_SETUP;

			const { black_uid, white_uid } = game_setup;
			moves_id = game_setup.moves_id;

			console.log("exists", { black_uid, white_uid });

			const player_already_joined =
				(black_uid && black_uid === user_id) ||
				(white_uid && white_uid === user_id);

			const am_i_white = white_uid === user_id;

			if (!player_already_joined) {
				log("user already joined");
				log("subscribe message PUBLISH");
				await redis.publish(STR_GAME_JOIN, user_id);
			}

			const opponent_uid = am_i_white ? black_uid : white_uid;
			const opp = await getOpp(opponent_uid);

			const game_token = Utils.generate_game_token({ am_i_white, moves_id });

			skt.emit("player_joined", { opp, am_i_white, game_token });
		}

		const STR_GAME_MOVES = `moves:${moves_id}`;
		await subscriber.subscribe(STR_GAME_MOVES, (newPgn) => {
			skt.emit("game_moves_incoming", newPgn);
		});

		const pgn = await Utils.ensure_and_get_moves_pgn(moves_id);

		log({ pgn });
		skt.emit("game_moves_incoming", pgn);
	});
}
