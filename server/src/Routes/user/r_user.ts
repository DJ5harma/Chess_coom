import { Router } from "express";
import { asyncHandler } from "../../Middleware/asyncHandler";
import { c_user_register } from "./controllers/c_user_register";
import { c_user_login } from "./controllers/c_user_login";
import { c_user_games_history } from "./controllers/c_user_games_history";
import { auth } from "../../Middleware/auth";

export const r_user = Router();

r_user.post("/register", asyncHandler(c_user_register));
r_user.post("/login", asyncHandler(c_user_login));
r_user.post("/games_history", asyncHandler(auth), asyncHandler(c_user_games_history));
