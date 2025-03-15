import { log } from "console";
import { createClient } from "redis";

export const redis = createClient();
export const redis2 = redis.duplicate();

export const redisConnect = async () => {
	redis.on("error", (err) => log("Redis 1 Client error", err));
	redis2.on("error", (err) => log("Redis 2 Client error", err));

	await Promise.all([await redis.connect(), await redis2.connect()]);
	log("Redis 1 & 2 connected on PORT :", 6379);
};
