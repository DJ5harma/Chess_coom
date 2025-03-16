import { log } from "console";
import { randomUUID } from "crypto";

export function game_create(skt: skt) {
	skt.on("game_create", () => {
		log("game create request");
		skt.emit("game_create_res", { game_id: randomUUID() });
	});
}
