import { Redis } from "ioredis";

import { env } from "#/config/env";

const redis = new Redis(env.redisURL);
const subcriber = new Redis(env.redisURL);
const publisher = new Redis(env.redisURL);

const channels = {
	lobby: {
		commands: "api:lobby:commands",
		created: "mc:lobby:created",
		events: "mc:lobby:events",
		stats: (lobbyId: string) => `mc:lobby:${lobbyId}:stats`,
		statsPattern: "mc:lobby:*:stats",
	},
	friend: {
		request: "mc:friend:request",
	},
} as const;

export { redis, subcriber, publisher, channels };
