import { useEffect, useState } from "react";
import { useSocket } from "../Providers/SocketProvider";
import { useNavigate } from "react-router-dom";

export const CreateGame = () => {
	const [gameId, setGameId] = useState("");
	const [canceled, setCanceled] = useState(true);
	const { skt } = useSocket();
	const navigate = useNavigate();

	useEffect(() => {
		const game_create_res = ({ game_id }: { game_id: string }) => {
			console.log({ game_id });
			setGameId(game_id);
		};
		skt.on("game_create_res", game_create_res);
		return () => {
			skt.removeListener("game_create_res", game_create_res);
		};
	}, []);

	return (
		<div className="flex flex-col items-center gap-2 p-4">
			{gameId && !canceled ? (
				<>
					<p className="bg-black px-4 py-2 rounded-2xl">{gameId}</p>
					<button
						onClick={() => navigate(`/Play/${gameId}`)}
						className="bg-blue-800"
					>
						Join here
					</button>
					<button onClick={() => setCanceled(true)} className="bg-red-800">
						Cancel
					</button>
				</>
			) : (
				<>
					<button
						onClick={() => {
                            if(!gameId.length) skt.emit("game_create");
                            else setCanceled(false)
						}}
						className="bg-blue-800"
					>
						Create new Game
					</button>
				</>
			)}
		</div>
	);
};
