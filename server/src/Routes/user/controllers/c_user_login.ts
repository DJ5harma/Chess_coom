import { Request, Response } from "express";
import { USER } from "../../../Database/USER";
import { sign } from "jsonwebtoken";
import { compareSync } from "bcryptjs";
import { redis } from "../../../Redis/redis";
import { LABELS } from "../../../Misc/LABELS";

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

	redis.HSET(LABELS.REDIS_USER_DATA(user._id), { username } as REDIS_USER_DATA);

	res.json({ auth_token, username: user.username } as result);
	return;
};
