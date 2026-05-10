import { Redis } from "ioredis";

import { env } from "#/config/env";

const redis = new Redis(env.redisConnectionString);
const subcriber = new Redis(env.redisConnectionString);
const publisher = new Redis(env.redisConnectionString);

const channels = {
	lobby: {
		// API → Minestom: all lobby commands go on one channel,
		// discriminated by the `type` field in the payload.
		commands: "api:lobby:commands",

		created: "mc:lobby:created",
		// High-frequency stat updates kept on their own channel
		// so subscribers can opt in without getting flooded.
		stats: (lobbyId: string) => `mc:lobby:${lobbyId}:stats`,
	},
} as const;

// ============================================================
// Message payloads
// ============================================================

type LobbyConfig = {
	name: string;
	maxPlayers: number;
	// ...whatever else a lobby has
};

// Commands: API → Minestom
type LobbyCommand =
	| {
			type: "create";
			name: string;
			maxPlayers: number;
			replyTo?: string;
	  }
	| {
			type: "edit";
			lobbyId: string;
			changes: Partial<LobbyConfig>;
	  }
	| {
			type: "delete";
			lobbyId: string;
	  }
	| {
			type: "kick";
			lobbyId: string;
			playerId: string;
			reason?: string;
	  };

// Events: Minestom → API
type LobbyCreatedEvent = {
	type: "created";
	lobbyId: string;
	config: LobbyConfig;
};

type LobbyEvent =
	| { type: "edited"; lobbyId: string; changes: Partial<LobbyConfig> }
	| { type: "deleted"; lobbyId: string };

type LobbyStats = {
	type: "stats";
	lobbyId: string;
	tick: number;
	players: Array<{
		playerId: string;
		health: number;
		x: number;
		y: number;
		z: number;
	}>;
};

export { redis, subcriber, publisher, channels };
