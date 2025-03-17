import { verify, sign } from "jsonwebtoken";
import { redis } from "../Redis/redis";
import { Chess } from "chess.js";
import { USER } from "../Database/USER";
import { LABELS } from "./LABELS";

const initial_chess = new Chess();

export const UTILS = {
	verify_game_token(game_token: string) {
		const data = verify(game_token, process.env.JWT_SECRET!);

		if (!data) return undefined;
		return data as GAME_TOKEN_DATA;
	},

	async ensure_and_get_moves_pgn(moves_id: string) {
		let pgn = await redis.GET(LABELS.REDIS_GAME_MOVES_DATA(moves_id));
		if (!pgn) {
			pgn = initial_chess.pgn();
			await redis.SET(LABELS.REDIS_GAME_MOVES_DATA(moves_id), pgn);
		}
		return pgn;
	},

	async is_user_cache_ensured(user_id: string) {
		if (await redis.EXISTS(LABELS.REDIS_USER_DATA(user_id))) return true;

		const user = await USER.findById(user_id);
		if (!user) return false;

		await redis.HSET(LABELS.REDIS_USER_DATA(user_id), {
			username: user.username,
		} as REDIS_USER_DATA);
		return true;
	},

	generate_game_token({ am_i_white, moves_id, game_id }: GAME_TOKEN_DATA) {
		const game_token = sign(
			{
				am_i_white,
				moves_id,
				game_id,
			},
			process.env.JWT_SECRET!
		);
		return game_token;
	},

	get_user_id(auth_token: string) {
		if (!auth_token) return undefined;
		const { _id } = verify(auth_token, process.env.JWT_SECRET!) as {
			_id?: string;
		};
		return _id;
	},
};
