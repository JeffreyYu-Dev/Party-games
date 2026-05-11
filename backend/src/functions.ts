import ky from "ky";

import { publisher, channels, subcriber } from "./services/redis";
import { env } from "./config/env";

const base = env.minestomURL;

const baseHeaders = {
	"content-type": "application/json",
};

async function createLobby(name: string, map: string, playerCap: number) {
	return await ky.post(`${base}/lobby`, {
		json: {
			name,
			map,
			playerCap,
		},
		headers: {
			...baseHeaders,
		},
	});
}

async function deleteLobby(id: string) {
	return await ky.delete(`${base}/lobby/${id}`, {
		headers: { ...baseHeaders },
	});
}

async function editLobby(id: string, name: string) {
	return await ky.patch(`${base}/lobby/${id}`, {
		json: { name },
		headers: { ...baseHeaders },
	});
}

export { createLobby, deleteLobby, editLobby };
