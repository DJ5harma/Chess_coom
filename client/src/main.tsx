// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";

createRoot(document.getElementById("root")!).render(
	<>
		{/* <StrictMode> */}
		<ToastContainer
			closeButton
			position="top-center"
			stacked
			toastStyle={{ backgroundColor: "rgb(10, 10, 44)", color: "white" }}
		/>
		<BrowserRouter>
			<App />
		</BrowserRouter>
		{/* </StrictMode> */}
	</>
);
