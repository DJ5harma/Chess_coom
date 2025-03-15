import { useEffect, useRef, useState } from "react";
import { Chess, Square } from "chess.js";
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
		function player_joined({
			opp,
			am_i_white,
		}: {
			opp: Opponent;
			am_i_white: boolean;
		}) {
			console.log("PLayer joined", opp);

			setOpponent(opp);
			setBoardDetails({ ...boardDetails, am_i_white });
		}

		setTimeout(() => {
			skt.emit("game_join_as_player", game_id);
			skt.on("player_joined", player_joined);
		}, 0);
	}, []);

	return (
		<div>
			{opponent?.username}
			<Chessboard
				boardWidth={window.innerHeight - 10}
				position={game.fen()}
				onPieceDrop={onDrop}
				boardOrientation={boardDetails.am_i_white ? "white" : "black"}
			/>
		</div>
	);
}
