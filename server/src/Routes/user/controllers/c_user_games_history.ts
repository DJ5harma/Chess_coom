import { Request, Response } from "express";
import { USER } from "../../../Database/USER";
import { log } from "console";
import { Types } from "mongoose";

type body = {
    limit: number;
    skip: number;
};

type result = {
    games: {
        _id: string;
        moveCount: string;
        opponent: {
            _id: string;
            username: string;
        };
        am_i_white: boolean;
        pgn: string;
        result: "b" | "w" | "d";
    }[];
};

export async function c_user_games_history(req: Request, res: Response) {
    const { limit, skip } = req.body as body;
    const user_id = req.body._id as string;

    const user = await USER.findById(user_id)
        .select("games")
        .populate("games")
        .skip(skip)
        .limit(limit)
        .populate({
            path: "games",
            select: "white black moveCount result pgn _id",
            populate: { path: "white black", select: "_id username" },
        });

    const games = user.games.map(
        ({
            black,
            moveCount,
            pgn,
            result,
            white,
            _id,
        }: {
            white: { username: string; _id: string };
            black: { username: string; _id: string };
            moveCount: number;
            result: "w" | "b" | "d";
            pgn: string;
            _id: string; // no need to specify as type of ObjectId cause it'll get converted to string anyways
        }) => {
            const am_i_white = new Types.ObjectId(user_id).equals(white._id);
            return {
                moveCount: moveCount,
                opponent: am_i_white ? black : white,
                am_i_white,
                pgn,
                result,
                _id,
            };
        }
    );
    res.json({ games } as result);
    return;
}
