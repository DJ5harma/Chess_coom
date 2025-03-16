import { useEffect, useRef, useState } from "react";
import { Chess, Move, Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useSocket } from "../Providers/SocketProvider";

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

	function makeAMove(move: any) {
		const result = game.move(move);
		setFlag(!flag);
		return result; // null if the move was illegal, the move object if the move was legal
	}

	function onDrop(sourceSquare: Square, targetSquare: Square) {
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
		setTimeout(() => {
			skt.emit("game_join_as_player", game_id);
		}, 0);
	}, []);

	useEffect(() => {
		function game_moves_incoming(newPgn: string) {
			game.loadPgn(newPgn);
			setFlag(!flag);
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

			setOpponent(opp);
			setBoardDetails({ ...boardDetails, am_i_white });
			setGameToken(game_token);
		}
		setTimeout(() => {
			skt.on("player_joined", player_joined);
			skt.on("game_moves_incoming", game_moves_incoming);
		}, 0);

		return () => {
			// clearTimeout(tout);
		};
	}, [game, flag]);

	return (
		<div
			className="flex items-center justify-center w-screen h-screen"
			style={{ width: "90vh" }}
		>
			<div className="flex flex-col gap-2" style={{ width: "90%" }}>
				{opponent && "Opponent: " + opponent?.username}
				<Chessboard
					position={game.fen()}
					onPieceDrop={onDrop}
					boardOrientation={boardDetails.am_i_white ? "white" : "black"}
				/>
			</div>
		</div>
	);
}
