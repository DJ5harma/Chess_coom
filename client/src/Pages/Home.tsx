import { CreateGame } from "../Components/CreateGame";
import { GameHistory } from "../Components/GamesHIstory";
import { JoinGame } from "../Components/JoinGame";

export const Home = () => {
	return (
		<div className="h-full flex flex-wrap items-center justify-around gap-2 [&>div]:border-2">
			<JoinGame />
			<CreateGame />
			<GameHistory />
		</div>
	);
};
