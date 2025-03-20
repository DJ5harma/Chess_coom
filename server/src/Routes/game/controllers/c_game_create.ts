import { randomUUID } from "crypto";
import { Request, Response } from "express";

type result = {
	game_id: string;
}

export function c_game_create(_: Request, res: Response) {
    res.json({ game_id: randomUUID() } as result);
    return;
}
