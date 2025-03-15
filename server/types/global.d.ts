export {};

declare global {
	type GAME_SETUP = {
		moves_id: string;
		white_uid: string;
		black_uid: string;
	};
	var GAME_SETUP: GAME_SETUP;

	type USER_DATA = {
		username: string;
	};
	var USER_DATA: USER_DATA;
}
