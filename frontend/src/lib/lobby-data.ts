export type LobbyStatus = "healthy" | "full" | "degraded" | "empty" | "offline";

export interface Player {
	id: string;
	username: string;
}

export interface Lobby {
	id: string;
	name: string;
	map: string;
	playerCap: number;
	players: Player[];
	startedAt: number;
	// derived
	count: number;
	status: LobbyStatus;
	uptime: string;
}

// Shape returned by Minestom HTTP endpoints
export interface MinestomLobby {
	id: string;
	name: string;
	playerCap: number;
	players: Player[];
	map: string;
	startedAt: number;
}

export function minestomToLobby(raw: MinestomLobby): Lobby {
	const count = raw.players.length;
	const status: LobbyStatus =
		count === 0 ? "empty" : count >= raw.playerCap ? "full" : "healthy";
	return {
		...raw,
		count,
		status,
		uptime: formatUptime(raw.startedAt),
	};
}

export function formatUptime(startedAt: number, nowMs = Date.now()): string {
	const secs = Math.max(0, Math.floor(nowMs / 1000) - startedAt);
	const h = Math.floor(secs / 3600);
	const m = Math.floor((secs % 3600) / 60);
	const s = secs % 60;
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export const STATUS_CONFIG: Record<
	LobbyStatus,
	{ label: string; color: string; dot: string }
> = {
	healthy: {
		label: "Healthy",
		color: "text-emerald-400",
		dot: "bg-emerald-400",
	},
	full: { label: "Full", color: "text-blue-400", dot: "bg-blue-400" },
	degraded: {
		label: "Degraded",
		color: "text-amber-400",
		dot: "bg-amber-400",
	},
	empty: {
		label: "Empty",
		color: "text-muted-foreground",
		dot: "bg-muted-foreground/50",
	},
	offline: { label: "Offline", color: "text-red-400", dot: "bg-red-400" },
};
