import { io, Socket } from "socket.io-client";
import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { toast } from "react-toastify";

const context = createContext<{
	skt: Socket | null;
}>({
	skt: null,
});

export function SocketProvider({ children }: { children: ReactNode }) {
	const socketRef = useRef(
		io("http://localhost:4000", {
			// autoConnect: false,
			transports: ["websocket"],
		})
	);

	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		if (isConnected) return;
		socketRef.current.connect();
		socketRef.current.on("connect", () => {
			toast.success("Socket server connected!");
			setIsConnected(true);
		});

		return () => {
			socketRef.current.disconnect();
		};
	}, []);

	// if (!isConnected) return <>Connecting to Websocket</>;

	return (
		<context.Provider value={{ skt: socketRef.current }}>
			{children}
		</context.Provider>
	);
}

export const useSocket = () =>
	useContext(context) as {
		skt: Socket;
	};
