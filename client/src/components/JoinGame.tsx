import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const JoinGame = () => {
	const [IdEntry, setIdEntry] = useState("");
	const navigate = useNavigate();
	function handleJoinEnteredId() {
		for (let i = IdEntry.length - 1; i != -1; --i) {
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
		<div className="flex flex-col items-center gap-2 p-4">
			<h1>Play a P2P chess match!</h1>
			{/* <PlayRandomMoveEngine /> */}
			<input
				value={IdEntry}
				onChange={(e) => setIdEntry(e.target.value)}
				type="text"
				placeholder="Enter game id"
			/>
			<button className="bg-blue-800" onClick={handleJoinEnteredId}>Join entered Game id</button>
           {IdEntry ?  <button onClick={() => setIdEntry('')} className="bg-red-800">Cancel</button> : null}
		</div>
	);
};
