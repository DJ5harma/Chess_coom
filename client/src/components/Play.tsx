import { useEffect, useRef, useState } from "react";
import { Chess, Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useSocket } from "../Providers/SocketProvider";

export function Play() {
	const { game_id } = useParams();
	const { skt } = useSocket();
	console.log({ game_id }, "play route");

	const { current: game } = useRef(new Chess());
	const [flag, setFlag] = useState(true);

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

		return true;
	}

	useEffect(() => {
		skt.emit("game_join_as_player", game_id);
	}, []);

	return (
		<div>
			<Chessboard
				boardWidth={window.innerHeight - 10}
				position={game.fen()}
				onPieceDrop={onDrop}
			/>
		</div>
	);
}
