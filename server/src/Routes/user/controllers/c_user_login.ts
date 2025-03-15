import { Request, Response } from "express";
import { USER } from "../../../Database/USER";
import { sign } from "jsonwebtoken";
import { compareSync } from "bcryptjs";
import { redis } from "../../../Redis/redis";
import { u_user_ensure_cache } from "../utils/u_user_ensure_cache";

type body = {
	username: string;
	password: string;
};

type result = {
	auth_token: string;
	username: string;
};

export const c_user_login = async (req: Request, res: Response) => {
	const { username, password } = req.body as body;

	const user = await USER.findOne({ username }).select("_id hashedPassword");

	if (!user || !compareSync(password, user.hashedPassword))
		throw new Error("Invalid credentials!");

	const auth_token = sign({ _id: user._id }, process.env.JWT_SECRET!);

	console.log(user.username);

	u_user_ensure_cache(user._id, { data: { username } });

	redis.HSET(`user:${user._id}:data`, { username } as USER_DATA);

	res.json({ auth_token, username: user.username } as result);
	return;
};
