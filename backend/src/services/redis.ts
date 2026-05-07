import { Redis } from "ioredis";

import { env } from "#/config/env";

const redis = new Redis(env.redisConnectionString);
const subcriber = new Redis(env.redisConnectionString);
const publisher = new Redis(env.redisConnectionString);

const channels = {
	lobby: {
		publish: {
			// send a command to minestom to create lobby
			create: "Lobby:create",

			// send a command to minestom to edit this lobby
			edit: (lobbyId: string) => `Lobby:${lobbyId}:edit`,

			// send a command to minestom to remove this lobby
			delete: (lobbyId: string) => `Lobby:${lobbyId}:delete`,

			kickPlayer: (lobbyId: string, player: string) =>
				`Lobby:${lobbyId}:kick:${player}`,
		},

		subscribe: {
			// listen to lobby
			stats: (lobbyId: string) => `Lobby:${lobbyId}:stats`,
		},
	},
} as const;

export { redis, subcriber, publisher, channels };
