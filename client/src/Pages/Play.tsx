import { useEffect, useRef, useState } from "react";
import { Chess, Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useSocket } from "../Providers/SocketProvider";
import { useUser } from "../Providers/UserProvider";

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
		const tout = setTimeout(() => {
			skt.on("player_joined", player_joined);
			skt.on("game_moves_incoming", game_moves_incoming);

			console.log({ username });
		}, 0);

		return () => {
			clearTimeout(tout);
		};
	});

	const FormattedMoves = () => {
		const history = game.history();
		const res: [string, string][] = [];

		for (let i = 0; i < history.length; i += 2)
			res.push([history[i], history[i + 1]]);

		return (
			<div
				className="flex flex-col w-full overflow-auto text-xs"
				style={{ maxHeight: "30vh" }}
			>
				{res.reverse().map(([white, black], i) => {
					return (
						<div
							key={i}
							className="flex w-full border-t-2 border-white [&>p]:w-full [&>p]:text-center [&>p]:p-2"
						>
							<p className="bg-blue-950">
								{Math.ceil(history.length / 2) - i}.
							</p>
							<p className="bg-blue-800">{white}</p>
							<p className="bg-blue-950">{black}</p>
						</div>
					);
				})}
			</div>
		);
	};

	return (
		<div className="flex items-center justify-around h-screen w-screen gap-4 px-4">
			<div style={{ width: "92vh" }}>
				<Chessboard
					position={game.fen()}
					onPieceDrop={onDrop}
					boardOrientation={boardDetails.am_i_white ? "white" : "black"}
				/>
			</div>
			<div className="flex flex-col" style={{ width: "calc(100vw - 92vh)" }}>
				<p className="bg-black p-3">
					{(opponent && "Opponent: " + opponent?.username) || "Opponent"}
				</p>
				<FormattedMoves />
				<p className="bg-black p-3">Player: {username}</p>
			</div>
		</div>
	);
}
