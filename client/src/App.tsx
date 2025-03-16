import { Play } from "./Pages/Play";
import { Route, Routes } from "react-router-dom";
import { UserProvider } from "./Providers/UserProvider";
import { Form } from "./Pages/Form";
import { Home } from "./Pages/Home";
import { SocketProvider } from "./Providers/SocketProvider";
import { Nav } from "./Components/Nav";

export default function App() {
	return (
		<div className="flex flex-col gap-2 h-screen">
			<SocketProvider>
				<UserProvider>
					<Nav />
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/Home" element={<Home />} />
						<Route path="/Form" element={<Form />} />
						<Route path="/Play/:game_id" element={<Play />} />
					</Routes>
				</UserProvider>
			</SocketProvider>
		</div>
	);
}
