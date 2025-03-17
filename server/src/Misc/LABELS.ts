export const LABELS = {
	REDIS_USER_DATA(user_id: string) {
		return `user:${user_id}:data`;
	},
	REDIS_GAME_MOVES_DATA(moves_id: string) {
		return `moves:${moves_id}`;
	},
    REDIS_GAME_SETUP_DATA(game_id: string){
        return `game:${game_id}:setup`
    },
    REDIS_GAME_MOVE_CHANNEL(moves_id: string){
        return `channel:${moves_id}:move`
    },
    REDIS_GAME_JOIN_AS_PLAYER_CHANNEL(game_id: string){
        return `channel:${game_id}:player`
    }
};
