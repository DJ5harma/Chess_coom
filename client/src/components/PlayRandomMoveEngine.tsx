import { useEffect, useRef, useState } from "react";
import { Chess, Square } from "chess.js";
import { Chessboard } from "react-chessboard";

export function PlayRandomMoveEngine() {
	const { current: game } = useRef(new Chess());
	const [flag, setFlag] = useState(true);

	function makeAMove(move: any) {
		const result = game.move(move);
		setFlag(!flag);
		return result; // null if the move was illegal, the move object if the move was legal
	}

	function makeRandomMove() {
		const possibleMoves = game.moves();
		if (game.isGameOver() || game.isDraw() || possibleMoves.length === 0)
			return; // exit if the game is over
		const randomIndex = Math.floor(Math.random() * possibleMoves.length);
		makeAMove(possibleMoves[randomIndex]);
	}

	function onDrop(sourceSquare: Square, targetSquare: Square) {
		const move = makeAMove({
			from: sourceSquare,
			to: targetSquare,
			promotion: "q", // always promote to a queen for example simplicity
		});

		// illegal move
		return move !== null;
	}

	useEffect(() => {
		const int = setInterval(makeRandomMove, 1500);
		return () => {
			clearInterval(int);
		};
	}, [flag]);

	return <Chessboard position={game.fen()} onPieceDrop={onDrop} />;
}
