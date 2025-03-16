import { useEffect, useState } from "react";
import { PlayRandomMoveEngine } from "../Components/PlayRandomMoveEngine";
import { useSocket } from "../Providers/SocketProvider";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const Home = () => {
	const [gameId, setGameId] = useState("");
	const [IdEntry, setIdEntry] = useState("");

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

	function handleJoinEnteredId() {
		for(let i = IdEntry.length - 1; i != -1; --i) {
			if (IdEntry[i] === "/") {
				i++;
				let id = "";
				while (i < IdEntry.length) id += IdEntry[i++];
				navigate(`/Play/${id}`);
				return;
			}
		}
		navigate(`/Play/${IdEntry}`);
	}

	return (
		<div className="h-full flex flex-col items-center justify-center gap-2">
			<h1>Play a P2P chess match!</h1>
			{/* <PlayRandomMoveEngine /> */}
			<input
				value={IdEntry}
				onChange={(e) => setIdEntry(e.target.value)}
				type="text"
				placeholder="Enter game id"
			/>
			<button onClick={handleJoinEnteredId}>Join entered Game id</button>
			<h1>OR</h1>
			{gameId ? (
				<>
					<p>{gameId}</p>
					<button onClick={() => navigate(`/Play/${gameId}`)}>Join here</button>
				</>
			) : (
				<button onClick={() => skt.emit("game_create")}>Create new Game</button>
			)}
		</div>
	);
};
