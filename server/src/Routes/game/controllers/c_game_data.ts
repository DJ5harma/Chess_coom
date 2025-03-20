import { Request, Response } from "express";
import { GAME } from "../../../Database/GAME";

type body = {
    game_id: string;
};

type result = {
    game: TGameData;
};

type TGameData = {
    pgn: string;
    white: { username: string; _id: string };
    black: { username: string; _id: string };
    result: string;
    moveCount: number;
};

export async function c_game_data(req: Request, res: Response) {
    const { game_id } = req.body as body;
    const game = (await GAME.findById(game_id)
        .select("pgn white black result moveCount")
        .populate({ path: "white black", select: "_id username" })) as TGameData;

    res.json({ game } as result);
    return;
}
