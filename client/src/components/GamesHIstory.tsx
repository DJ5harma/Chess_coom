import { useEffect, useState } from "react";
import { api } from "../Systems/api";
import { Link } from "react-router-dom";

type TGamesHistory = {
    _id: string;
    moveCount: string;
    opponent: {
        _id: string;
        username: string;
    };
    am_i_white: boolean;
    pgn: string;
    result: "b" | "w" | "d";
}[];

export const GameHistory = () => {
    const [limit, setLimit] = useState(5);
    const [skip, setSkip] = useState(0);

    const [gamesHistory, setGamesHistory] = useState<TGamesHistory>([]);

    useEffect(() => {
        api.req("user/games_history", {
            limit,
            skip,
            auth_token: localStorage.getItem("auth_token"),
        }).then(({ games }: { games: TGamesHistory }) => {
            console.log({ games });
            setGamesHistory((p) => [...p, ...games]);
        });
    }, []);

    return (
        <div className="w-full p-4 flex flex-col justify-center gap-2">
            <h1>Your Game History</h1>
            {gamesHistory.map(
                ({ _id, am_i_white, moveCount, opponent, pgn, result }) => {
                    let outcome = "";
                    if (result === "d") outcome = "DRAW";
                    else if (result === "b")
                        outcome = am_i_white ? "Lost" : "Won";
                    else if (result === "w")
                        outcome = !am_i_white ? "Lost" : "Won";
                    return (
                        <div key={_id} className="rounded-lg border p-4">
                            <p>Opponent: {opponent.username}</p>
                            <p>Result: {outcome}</p>
                            <p>moves: {moveCount}</p>
                            <p>My color: {am_i_white ? "white" : "black"}</p>
                            <Link to={`/Analyze/${_id}`}>
                                <button className="bg-green-700">
                                    Analyze Game
                                </button>
                            </Link>
                        </div>
                    );
                }
            )}
        </div>
    );
};
