import { useState } from "react";
import { Chessboard } from "react-chessboard";

export default function App() {
	const [moves, setMoves] = useState();

	return (
		<div style={{ width: "90vh", display: "flex" }}>
			{/* <PlayRandomMoveEngine /> */}
		</div>
	);
}
