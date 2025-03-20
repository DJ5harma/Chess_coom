import { Router } from "express";
import { asyncHandler } from "../../Middleware/asyncHandler";
import { c_game_data } from "./controllers/c_game_data";
import { c_game_create } from "./controllers/c_game_create";

export const r_game = Router();

r_game.post("/game_data", asyncHandler(c_game_data));
r_game.post("/game_create", asyncHandler(c_game_create));
