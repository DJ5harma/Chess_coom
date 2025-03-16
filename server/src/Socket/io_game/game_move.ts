import { Chess } from "chess.js";
import { redis } from "../../Redis/redis";
import { log } from "console";
import { Utils } from "../../utils";

let chess = new Chess();

export function game_move(skt: skt) {
	skt.on("game_move", async ({ move, game_token }) => {
		try {
			log({ game_token });
			if (!game_token) return;
			const game = Utils.verify_game_token(game_token);
			if (!game) return;

			const { am_i_white, moves_id } = game;

			const STR_GAME_MOVES = `moves:${moves_id}`;

			chess.loadPgn(await Utils.ensure_and_get_moves_pgn(moves_id));

			const turn = am_i_white ? "w" : "b";
			if (turn !== chess.turn()) return;

			const valid_move = chess.move(move);
			log({ valid_move });
			if (!valid_move) return;

			const newPgn = chess.pgn();

			await redis.SET(STR_GAME_MOVES, newPgn);
			redis.publish(STR_GAME_MOVES, newPgn);
			// log({ moves });

			// chess.clear();
		} catch (error) {
			log({ error });
		}
	});
}
