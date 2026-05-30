import ky from "ky";

import { env } from "../config/env";

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

async function getLobbies() {
	return await ky.get(`${base}/lobby/list`, { headers: baseHeaders });
}

async function getLobby(id: string) {
	return await ky.get(`${base}/lobby/${id}`, { headers: baseHeaders });
}

async function kickPlayer(lobbyId: string, playerId: string) {
	return await ky.post(`${base}/lobby/${lobbyId}/kick`, {
		json: { playerId },
		headers: { ...baseHeaders },
	});
}

async function movePlayer(
	lobbyId: string,
	playerId: string,
	targetLobbyId: string,
) {
	return await ky.post(`${base}/lobby/${lobbyId}/move`, {
		json: { playerId, targetLobbyId },
		headers: { ...baseHeaders },
	});
}

export {
	createLobby,
	deleteLobby,
	editLobby,
	getLobbies,
	getLobby,
	kickPlayer,
	movePlayer,
};
