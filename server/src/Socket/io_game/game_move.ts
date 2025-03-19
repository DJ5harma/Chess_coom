import { Chess } from "chess.js";
import { redis } from "../../Redis/redis";
import { log } from "console";
import { UTILS } from "../../Misc/UTILS";
import { GAME } from "../../Database/GAME";
import { USER } from "../../Database/USER";
import { LABELS } from "../../Misc/LABELS";

let chess = new Chess();

export function game_move(skt: skt) {
    skt.on("game_move", async ({ move, game_token }) => {
        log({ game_token });
        if (!game_token) return;
        const game = UTILS.verify_game_token(game_token);
        if (!game) return;

        const { am_i_white, moves_id } = game;

        chess.loadPgn(await UTILS.ensure_and_get_moves_pgn(moves_id));

        const turn = am_i_white ? "w" : "b";
        if (turn !== chess.turn()) return;

        const valid_move = chess.move(move);
        // log({ valid_move });

        if (!valid_move) return;

        const newPgn = chess.pgn();

        await redis.SET(LABELS.REDIS_GAME_MOVES_DATA(moves_id), newPgn);
        redis.publish(LABELS.REDIS_GAME_MOVE_CHANNEL(moves_id), newPgn);

        const is_cm = chess.isCheckmate();
        const is_draw = chess.isDraw();
        if (is_cm || is_draw) {
            const game_setup = (await redis.HGETALL(
                LABELS.REDIS_GAME_SETUP_DATA(game.game_id)
            )) as REDIS_GAME_SETUP_DATA;

            const newGame = new GAME({
                pgn: newPgn,
                white: game_setup.white_uid,
                black: game_setup.black_uid,
                result: is_cm ? turn : "d",
                moveCount: chess.moveNumber(),
            });
            await newGame.save();
            await USER.findByIdAndUpdate(game_setup.white_uid, {
                $push: { games: newGame._id },
            });
            await USER.findByIdAndUpdate(game_setup.black_uid, {
                $push: { games: newGame._id },
            });

            await redis.DEL(LABELS.REDIS_GAME_MOVES_DATA(moves_id));
            await redis.DEL(LABELS.REDIS_GAME_SETUP_DATA(game.game_id));
        }
    });
}
