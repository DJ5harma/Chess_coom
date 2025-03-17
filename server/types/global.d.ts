import { type DefaultEventsMap, type Socket } from "socket.io";

export {};

declare global {
	type REDIS_GAME_SETUP_DATA = {
		moves_id: string;
		white_uid: string;
		black_uid: string;
	};
	var REDIS_GAME_SETUP_DATA: REDIS_GAME_SETUP_DATA;

	type GAME_TOKEN_DATA = {
		am_i_white: boolean;
		moves_id: string;
		game_id: string;
	};
	var GAME_TOKEN_DATA: GAME_TOKEN_DATA;

	type REDIS_USER_DATA = {
		username: string;
	};
	var REDIS_USER_DATA: REDIS_USER_DATA;

	interface og_skt
		extends Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> {
		user_id?: string;
	}
	var og_skt: og_skt;

	interface skt extends og_skt {
		user_id: string;
	}
	var skt: skt;
}
