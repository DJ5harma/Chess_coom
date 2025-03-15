import { Router } from "express";
import { asyncHandler } from "../../Middleware/asyncHandler";
import { c_user_register } from "./controllers/c_user_register";
import { c_user_login } from "./controllers/c_user_login";

export const r_user = Router();

r_user.post("/register", asyncHandler(c_user_register));
r_user.post("/login", asyncHandler(c_user_login));
