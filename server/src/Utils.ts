import { verify } from "jsonwebtoken";
import { redis } from "./Redis/redis";
import { Chess } from "chess.js";

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
};
