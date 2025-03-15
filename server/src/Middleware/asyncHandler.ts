import { log } from "console";
import { Request, Response, NextFunction } from "express";

export const asyncHandler = (
	fn: (req: Request, res: Response, next: NextFunction) => Promise<void> | void
) => {
	return async function (req: Request, res: Response, next: NextFunction) {
		try {
			await fn(req, res, next);
			if (res.headersSent) return;
			next();
		} catch (err) {
			const message = (err as Error).message;

			log({ err: message });
			res.json({
				error: message || "Internal Server Error",
			});
			return;
		}
	};
};
