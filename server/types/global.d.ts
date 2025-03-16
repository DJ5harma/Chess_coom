import { DefaultEventsMap, Server, Socket } from "socket.io";

export {};

declare global {
	type GAME_SETUP = {
		moves_id: string;
		white_uid: string;
		black_uid: string;
	};
	var GAME_SETUP: GAME_SETUP;

	type GAME_TOKEN_DATA = {
		am_i_white: boolean;
		moves_id: string;
		game_id: string;
	};
	var GAME_TOKEN_DATA: GAME_TOKEN_DATA;

	type USER_DATA = {
		username: string;
	};
	var USER_DATA: USER_DATA;

	type io = Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
	var io: io;

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
