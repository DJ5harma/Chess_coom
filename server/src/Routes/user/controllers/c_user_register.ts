import { Request, Response } from "express";
import { USER } from "../../../Database/USER";
import { genSaltSync, hashSync } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { redis } from "../../../Redis/redis";

type body = {
	username: string;
	password: string;
	confirmPassword: string;
};

type result = {
	auth_token: string;
};

const minPasswordLength = 8;

export const c_user_register = async (req: Request, res: Response) => {
	const { username, password, confirmPassword } = req.body as body;

	if (password.length < minPasswordLength)
		throw new Error(`Password shorter than ${minPasswordLength} chars`);

	if (password !== confirmPassword) throw new Error("Passwords mismatch");

	if (await USER.exists({ username }))
		throw new Error("Username already registered");

	const hashedPassword = hashSync(password, genSaltSync(10));
	const user = new USER({
		username,
		hashedPassword,
	});

	user.save();

	const auth_token = sign({ _id: user._id }, process.env.JWT_SECRET!);

	redis.HSET(`user:${user._id}:data`, { username } as USER_DATA);

	res.json({ auth_token } as result);
	return;
};
