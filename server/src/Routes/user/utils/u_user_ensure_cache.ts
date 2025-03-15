import { USER } from "../../../Database/USER";
import { redis } from "../../../Redis/redis";

export async function u_user_ensure_cache(
	user_id: string,
	opts?: { data?: USER_DATA }
) {
	if (await redis.EXISTS(`user:${user_id}:data`)) return true;
	let d = opts?.data;
	if (!d) {
		const user = await USER.findById(user_id);
		if (!user) return false;
		d = { username: user.username } as USER_DATA;
	}
	await redis.HSET(`user:${user_id}:data`, d as USER_DATA);
	return true;
}
