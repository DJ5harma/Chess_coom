import {
	createContext,
	Dispatch,
	ReactNode,
	SetStateAction,
	useContext,
	useEffect,
	useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "./SocketProvider";

type Context = {
	username: string;
	setUsername: Dispatch<SetStateAction<string>>;
};

const ctx = createContext<Context>({
	username: "",
	setUsername: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
	const [username, setUsername] = useState("");
	const { skt } = useSocket();

	const navigate = useNavigate();

	useEffect(() => {
		if (username.length) localStorage.setItem("username", username);
	}, [username]);

	useEffect(() => {
		const auth_token = localStorage.getItem("auth_token");
		if (!auth_token) {
			navigate("/Form");
			return;
		}

		const stored_username = localStorage.getItem("username");
		if (stored_username) setUsername(username);
		skt.connect();
		skt.emit("register-my-socket-id", auth_token);

		return () => {
			skt.removeAllListeners();
			skt.disconnect();
		};
	}, []);

	return (
		<ctx.Provider value={{ username, setUsername }}>{children}</ctx.Provider>
	);
};

export const useUser = () => useContext(ctx);
