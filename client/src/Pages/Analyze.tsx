import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../Systems/api";
import { BoardInteractive } from "../Components/BoardInteractive";
import { Chess, Move, Square } from "chess.js";
import { IoPlaySkipBack, IoPlaySkipForward } from "react-icons/io5";
import { FormattedMoves } from "../Components/FormattedMoves";

type TGameData = {
    pgn: string;
    white: { username: string; _id: string };
    black: { username: string; _id: string };
    result: string;
    moveCount: number;
};

export const Analyze = () => {
    const { game_id } = useParams();
    const [gameData, setGameData] = useState<TGameData | undefined>(undefined);

    const [_, setFlag] = useState(true);

    const { current: chess } = useRef(new Chess());
    const { current: undoStack } = useRef<Move[]>([]);
    const [gameAltered, setGameAltered] = useState(false);

    useEffect(() => {
        api.req("game/game_data", { game_id }).then(
            ({ game }: { game: TGameData }) => {
                setGameData(game);
                chess.loadPgn(game.pgn);
                setFlag((p) => !p);
            }
        );
    }, []);

    function onDrop(sourceSquare: Square, targetSquare: Square) {
        const move = chess.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: "q", // always promote to a queen for example simplicity
        });
        setGameAltered(true);
        setFlag((p) => !p);

        if (!move) return false;
        return true;
    }

    function undo() {
        const move = chess.undo();
        if (move) undoStack.push(move);
        setFlag((p) => !p);
    }

    function redo() {
        const move = undoStack.pop();
        if (move) chess.move(move);
        setFlag((p) => !p);
    }

    function reset_to_original_game() {
        if (!gameData) return;
        chess.loadPgn(gameData.pgn);
        setGameAltered(false);
        setFlag((p) => !p);
    }

    if (!gameData) return <>Loading game data....</>;
    return (
        <div className="flex flex-wrap items-center justify-around flex-1 h-full gap-2">
            <p>{gameData.black.username} was Black</p>
            <p>{gameData.white.username} was White</p>
            <p>{gameData.result} won!</p>

            <div className="w-full flex gap-4 justify-center items-center [&>*]:cursor-pointer p-2 bg-black">
                <IoPlaySkipBack size={30} onClick={undo} />
                <IoPlaySkipForward size={30} onClick={redo} />
                {gameAltered && (
                    <>
                        <p>You changed the game</p>
                        <button
                            onClick={reset_to_original_game}
                            className="bg-green-900 p-4 rounded-2xl"
                        >
                            Reset to original
                        </button>
                    </>
                )}
            </div>

            <BoardInteractive
                bottom_color="w"
                fen={chess.fen()}
                onDrop={onDrop}
            />
            <FormattedMoves
                history={chess.history()}
                bottom={{ color: "w", username: gameData.white.username }}
                top={{ color: "b", username: gameData.black.username }}
            />
        </div>
    );
};
