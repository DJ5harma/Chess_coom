import { redis, subscriber } from "../../Redis/redis";
import { randomUUID } from "crypto";
import { UTILS } from "../../Misc/UTILS";
import { LABELS } from "../../Misc/LABELS";

export function game_join_as_player(skt: skt) {
	const user_id = skt.user_id;

	async function getOpp(opponent_uid: string) {
		return (await redis.HGETALL(
			LABELS.REDIS_USER_DATA(opponent_uid)
		)) as REDIS_USER_DATA;
	}

	skt.on("game_join_as_player", async (game_id: string) => {
		const game_setup_exists = await redis.EXISTS(
			LABELS.REDIS_GAME_SETUP_DATA(game_id)
		);

		let moves_id: string;

		if (!game_setup_exists) {
			// Early joiner
			const am_i_white = [true, false][Math.floor(Math.random() * 2)];
			moves_id = randomUUID();

			await redis.HSET(LABELS.REDIS_GAME_SETUP_DATA(game_id), {
				moves_id,
				white_uid: am_i_white ? user_id : "",
				black_uid: am_i_white ? "" : user_id,
			} as REDIS_GAME_SETUP_DATA);

			await subscriber.subscribe(
				LABELS.REDIS_GAME_JOIN_AS_PLAYER_CHANNEL(game_id),
				async (opponent_uid: string) => {
					await redis.HSET(
						LABELS.REDIS_GAME_SETUP_DATA(game_id),
						am_i_white ? "black_uid" : "white_uid",
						opponent_uid
					);
					const opp = await getOpp(opponent_uid);
					//

					const game_token = UTILS.generate_game_token({
						am_i_white,
						moves_id,
						game_id,
					});

					skt.emit("player_joined", { opp, am_i_white, game_token });
					subscriber.unsubscribe(
						LABELS.REDIS_GAME_JOIN_AS_PLAYER_CHANNEL(game_id)
					);
				}
			);
		} else {
			// Late joiner
			const game_setup = (await redis.HGETALL(
				LABELS.REDIS_GAME_SETUP_DATA(game_id)
			)) as REDIS_GAME_SETUP_DATA;

			const { black_uid, white_uid } = game_setup;
			moves_id = game_setup.moves_id;

			const player_already_joined =
				black_uid === user_id || white_uid === user_id;

			const am_i_white = white_uid === user_id;
			await redis.HSET(
				LABELS.REDIS_GAME_SETUP_DATA(game_id),
				am_i_white ? "white_uid" : "black_uid",
				user_id
			);

			if (!player_already_joined) {
				await redis.publish(
					LABELS.REDIS_GAME_JOIN_AS_PLAYER_CHANNEL(game_id),
					user_id
				);
			}

			const opponent_uid = am_i_white ? black_uid : white_uid;
			const opp = await getOpp(opponent_uid);

			const game_token = UTILS.generate_game_token({
				am_i_white,
				moves_id,
				game_id,
			});

			skt.emit("player_joined", { opp, am_i_white, game_token });
		}

		await subscriber.subscribe(
			LABELS.REDIS_GAME_MOVE_CHANNEL(moves_id),
			(newPgn) => {
				skt.emit("game_moves_incoming", newPgn);
			}
		);

		const pgn = await UTILS.ensure_and_get_moves_pgn(moves_id);

		skt.emit("game_moves_incoming", pgn);
	});
}
