import { useEffect, useRef, useState } from "react";
import { Chess, Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useSocket } from "../Providers/SocketProvider";
import { useUser } from "../Providers/UserProvider";
import { FormattedMoves } from "../Components/FormattedMoves";

type Opponent = {
	username: string;
};

export function Play() {
	const { game_id } = useParams();
	const { skt } = useSocket();

	console.log({ game_id }, "play route");

	const { current: game } = useRef(new Chess());
	const [flag, setFlag] = useState(true);

	const [opponent, setOpponent] = useState<null | Opponent>(null);
	const [boardDetails, setBoardDetails] = useState({
		am_i_white: true,
	});

	const [gameToken, setGameToken] = useState("");

	const { username } = useUser();

	function makeAMove(move: any) {
		const result = game.move(move);
		setFlag(!flag);
		return result; // null if the move was illegal, the move object if the move was legal
	}

	function onDrop(sourceSquare: Square, targetSquare: Square) {
		if (
			(boardDetails.am_i_white && game.turn() === "b") ||
			(!boardDetails.am_i_white && game.turn() === "w")
		)
			return false;
		const move = makeAMove({
			from: sourceSquare,
			to: targetSquare,
			promotion: "q", // always promote to a queen for example simplicity
		});

		if (!move) {
			toast("Invalid move!");
			return false;
		}

		skt.emit("game_move", { move, game_token: gameToken });

		return true;
	}

	useEffect(() => {
		function game_moves_incoming(newPgn: string) {
			game.loadPgn(newPgn);
			setFlag((p) => !p);
		}
		function player_joined({
			opp,
			am_i_white,
			game_token,
		}: {
			opp: Opponent;
			am_i_white: boolean;
			game_token: string;
		}) {
			console.log("PLayer joined", opp);
			toast.dismiss();
			toast(opp.username + " has joined!");

			setOpponent(opp);
			setBoardDetails({ ...boardDetails, am_i_white });
			setGameToken(game_token);
		}
		const timeout = setTimeout(() => {
			skt.emit("game_join_as_player", game_id);
			toast.loading("Waiting for your opponent...");
			skt.on("player_joined", player_joined);
			skt.on("game_moves_incoming", game_moves_incoming);
		}, 0);

		return () => {
			clearTimeout(timeout);
			skt.removeAllListeners();
		};
	}, []);

	return (
		<div className="flex flex-wrap items-center justify-around border-2 border-amber-300 flex-1 h-full gap-2">
			<div className="border-2 border-blue-500 h-full max-w-full max-h-full aspect-square">
				<Chessboard
					position={game.fen()}
					onPieceDrop={onDrop}
					boardOrientation={boardDetails.am_i_white ? "white" : "black"}
					customDarkSquareStyle={{ backgroundColor: "rgb(77, 115, 152)" }}
					customLightSquareStyle={{ backgroundColor: "rgb(235, 234, 213)" }}
				/>
			</div>
			<div className="flex flex-col min-w-md">
				<p
					className={`p-3 rounded-t-xl ${
						!boardDetails.am_i_white
							? "bg-white text-black"
							: "bg-black text-white"
					}`}
				>
					{(opponent && "Opponent: " + opponent?.username) || "Opponent"}
				</p>
				<FormattedMoves history={game.history()} />
				<p
					className={`p-3 rounded-b-xl ${
						boardDetails.am_i_white
							? "bg-white text-black"
							: "bg-black text-white"
					}`}
				>
					Player: {username}
				</p>
			</div>
		</div>
	);
}
