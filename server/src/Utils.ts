import { verify, sign } from "jsonwebtoken";
import { redis } from "./Redis/redis";
import { Chess } from "chess.js";
import { USER } from "./Database/USER";

const initial_chess = new Chess();

export const Utils = {
	verify_game_token(game_token: string) {
		const data = verify(game_token, process.env.JWT_SECRET!);

		if (!data) return undefined;
		return data as { am_i_white: boolean; moves_id: string };
	},

	async ensure_and_get_moves_pgn(moves_id: string) {
		const STR_GAME_MOVES = `moves:${moves_id}`;
		let pgn = await redis.GET(STR_GAME_MOVES);
		if (!pgn) {
			pgn = initial_chess.pgn();
			await redis.SET(STR_GAME_MOVES, pgn);
		}
		return pgn;
	},

	async ensure_user_cache(user_id: string, opts?: { data?: USER_DATA }) {
		if (await redis.EXISTS(`user:${user_id}:data`)) return true;
		let d = opts?.data;
		if (!d) {
			const user = await USER.findById(user_id);
			if (!user) return false;
			d = { username: user.username } as USER_DATA;
		}
		await redis.HSET(`user:${user_id}:data`, d as USER_DATA);
		return true;
	},

	generate_game_token({
		am_i_white,
		moves_id,
	}: {
		am_i_white: boolean;
		moves_id: string;
	}) {
		const game_token = sign(
			{
				am_i_white,
				moves_id,
			},
			process.env.JWT_SECRET!
		);
		return game_token;
	},
};
