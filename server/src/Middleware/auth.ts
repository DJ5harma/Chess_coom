import { Request } from "express";
import { verify } from "jsonwebtoken";

type body = {
	auth_token: string;
};

export const get_user_id = (auth_token: string) => {
	if (!auth_token) throw new Error("Auth token not found");
	const { _id } = verify(auth_token, process.env.JWT_SECRET!) as {
		_id?: string;
	};
	return _id;
};

export const auth = (req: Request) => {
	const { auth_token } = req.body as body;

	const _id = get_user_id(auth_token);

	if (!_id) throw new Error("Invalid auth token");

	req.body._id = _id;
};
