import axios from "axios";
import { toast } from "react-toastify";

const base = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
const Api = axios.create({ baseURL: base });

export class api {
	static url = {
		//
		user_register: base + "/user/register",
		user_login: base + "/user/login",
		//
		ai_send_message: base + "/ai/send_message",
		ai_obtain_tts_token: base + "/ai/obtain_tts_tokens",
	};

	static async req(endpoint: string, payload: Object, message?: string) {
		const loading = toast.loading(message || "Talking to server...");
		try {
			const data = (await Api.post(endpoint, payload)).data;

			toast.dismiss(loading);

			if (data.error) {
				toast.error("Error: " + data.error);
				return Promise.reject();
			}

			return data as any;
		} catch (err) {
			toast.dismiss(loading);

			toast.error("Error: " + (err as Error).message);
			return Promise.reject();
		}
	}

	static async test_server() {
		const res = await Api.get(base + "/test");
		console.log(res.data);
	}
}

// api.req(api.url.ai_send_message, {}).then((data) => {});
