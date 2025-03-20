import { Square } from "chess.js";
import { Chessboard } from "react-chessboard";

export const BoardInteractive = ({
    fen,
    onDrop,
    bottom_color,
}: {
    fen: string;
    onDrop: (sourceSquare: Square, targetSquare: Square) => boolean;
    bottom_color: "w" | "b";
}) => {
    return (
        <div className="h-4/5 max-w-full max-h-full aspect-square">
            <Chessboard
                position={fen}
                onPieceDrop={onDrop}
                boardOrientation={bottom_color === "w" ? "white" : "black"}
                customDarkSquareStyle={{ backgroundColor: "rgb(77, 115, 152)" }}
                customLightSquareStyle={{
                    backgroundColor: "rgb(235, 234, 213)",
                }}
            />
        </div>
    );
};
