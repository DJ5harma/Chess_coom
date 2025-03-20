import { FaChessKnight } from "react-icons/fa";
import { useUser } from "../Providers/UserProvider";
import { Link } from "react-router-dom";

export const Nav = () => {
    const { username } = useUser();
    // return null
    return (
        <nav className="w-full flex items-center justify-between p-3 gap-2 border-2 bg-black">
            <Link to={"/"}>
                <div className="flex items-center">
                    <FaChessKnight size={40} />
                    <h1 className="font-bold text-2xl">Chess_coom</h1>
                </div>
            </Link>
            <p>{username}</p>
        </nav>
    );
};
