import { useEffect, useRef, useState } from "react";
import { Chess, Square } from "chess.js";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../Providers/SocketProvider";
import { useUser } from "../Providers/UserProvider";
import { FormattedMoves } from "../Components/FormattedMoves";
import { BoardInteractive } from "../Components/BoardInteractive";

type Opponent = {
    username: string;
};

export function Play() {
    const { username } = useUser();
    const navigate = useNavigate();
    const { game_id } = useParams();
    const { skt } = useSocket();

    console.log({ game_id }, "play route");

    const { current: chess } = useRef(new Chess());
    const [_, setFlag] = useState(true);

    const [details, setDetails] = useState<{
        my_color: "w" | "b";
        opponent: null | Opponent;
    }>({
        my_color: "w",
        opponent: null,
    });

    const [gameToken, setGameToken] = useState("");

    function handleAfterMath(move_by: "w" | "b") {
        if (chess.isCheckmate()) {
            if (move_by !== details.my_color)
                toast.success("Checkmate! you won!");
            else toast("Checkmate! you lost!");
            navigate("/");
            return;
        }
        if (chess.isDraw()) {
            if (chess.isInsufficientMaterial())
                toast("Draw due to insufficient material!");
            else if (chess.isStalemate()) toast("Draw by Stalemate!");
            else if (chess.isThreefoldRepetition())
                toast("Draw by 3 fold repetition");
            else if (chess.isDrawByFiftyMoves()) toast("Draw by 50 moves!");
            else toast("Draw!");
            navigate("/");
        }
    }

    function onDrop(sourceSquare: Square, targetSquare: Square) {
        if (details.my_color !== chess.turn()) return false;

        const move = chess.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: "q", // always promote to a queen for example simplicity
        });
        setFlag((p) => !p);

        if (!move) {
            toast("Invalid move!");
            return false;
        }

        skt.emit("game_move", { move, game_token: gameToken });
        handleAfterMath(details.my_color);

        return true;
    }

    useEffect(() => {
        function game_moves_incoming(newPgn: string) {
            const move_by = chess.turn();
            chess.loadPgn(newPgn);
            setFlag((p) => !p);
            handleAfterMath(move_by);
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

            setDetails({
                ...details,
                opponent: opp,
                my_color: am_i_white ? "w" : "b",
            });
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
        <div className="flex flex-wrap items-center justify-around flex-1 h-full gap-2">
            <BoardInteractive
                bottom_color={details.my_color}
                fen={chess.fen()}
                onDrop={onDrop}
            />
            {details.opponent && (
                <FormattedMoves
                    history={chess.history()}
                    bottom={{ color: details.my_color, username }}
                    top={{
                        color: details.my_color === "b" ? "w" : "b",
                        username: details.opponent.username,
                    }}
                />
            )}
        </div>
    );
}
