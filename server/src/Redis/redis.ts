import { log } from "console";
import { createClient } from "redis";

export const redis = createClient();

export const redisConnect = async () => {
	redis.on("error", (err) => log("Redis Client error", err));

	await redis.connect();
	log("Redis connected on PORT :", 6379);
};
