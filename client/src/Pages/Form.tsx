import { useState } from "react";
import { useUser } from "../Providers/UserProvider";
import { api } from "../Systems/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const Form = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const [type, setType] = useState<"Login" | "Register">("Register");

	const userHook = useUser();
	const navigate = useNavigate();

	function handleRegister() {
		api
			.req(api.url.user_register, {
				username,
				password,
				confirmPassword,
			})
			.then(({ auth_token }: { auth_token: string }) => {
				userHook.setUsername(username);
				navigate("/");
				localStorage.setItem("auth_token", auth_token);
				toast.success("Registered Successfully!");
				window.location.reload();
			});
		}
		
		function handleLogin() {
			api
			.req(api.url.user_login, {
				username,
				password,
			})
			.then(({ auth_token }: { auth_token: string }) => {
				userHook.setUsername(username);
				navigate("/");
				localStorage.setItem("auth_token", auth_token);
				toast.success("Logged in Successfully!");
				window.location.reload();
			});
	}

	return (
		<div className="flex flex-col gap-4 items-center h-full justify-center border">
			<h1>Welcome to Chess_coom 😍</h1>
			<input
				type="text"
				placeholder={
					type === "Register" ? "A unique username" : "your registered username"
				}
				value={username}
				onChange={(e) => setUsername(e.target.value)}
			/>
			<input
				type="password"
				placeholder={
					type === "Register" ? "Make a new Password" : "Registered Password"
				}
				value={password}
				onChange={(e) => setPassword(e.target.value)}
			/>
			{type === "Register" && (
				<input
					type="password"
					placeholder="Confirm new Password"
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
				/>
			)}

			<button onClick={type === "Login" ? handleLogin : handleRegister}>
				{type}
			</button>

			{type === "Register" ? (
				<p>
					Already Registered? <b onClick={() => setType("Login")}>Login!</b>
				</p>
			) : (
				<p>
					New here? <b onClick={() => setType("Register")}>Register!</b>
				</p>
			)}
		</div>
	);
};
