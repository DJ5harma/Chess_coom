import { Chess } from "chess.js";
import { redis } from "../../Redis/redis";
import { log } from "console";
import { Utils } from "../../Utils";
import { GAME } from "../../Database/GAME";
import { USER } from "../../Database/USER";
import { Types } from "mongoose";

let chess = new Chess();

export function game_move(skt: skt) {
	skt.on("game_move", async ({ move, game_token }) => {
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
		// log({ valid_move });

		if (!valid_move) return;

		const newPgn = chess.pgn();

		await redis.SET(STR_GAME_MOVES, newPgn);
		redis.publish(STR_GAME_MOVES, newPgn);

		const is_cm = chess.isCheckmate();
		const is_draw = chess.isDraw();
		if (is_cm || is_draw) {
			const STR_GAME_SETUP = `game:${game.game_id}:setup`;

			const game_setup = (await redis.HGETALL(STR_GAME_SETUP)) as GAME_SETUP;

			const newGame = new GAME({
				pgn: newPgn,
				white: game_setup.white_uid,
				black: game_setup.black_uid,
				result: is_cm ? turn : "d",
			});
			await newGame.save();
			await USER.findByIdAndUpdate(game_setup.white_uid, {
				$push: { games: newGame._id },
			});
			await USER.findByIdAndUpdate(game_setup.black_uid, {
				$push: { games: newGame._id },
			});

			await redis.DEL(STR_GAME_MOVES);
			await redis.DEL(STR_GAME_SETUP);
		}
	});
}
