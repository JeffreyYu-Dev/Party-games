import { Hono } from "hono";
import { websocket } from "hono/bun";

import { subcriber, channels } from "./services/redis/redis";
import { broadcast } from "./routers/websocket/websocket";
import { RedisRouter } from "./services/redis/redisRouter";

import websocketRouter from "#/routers/websocket/websocket";

import httpRouter from "#/routers/http";

const app = new Hono();

// ── Redis → WS bridge ────────────────────────────────────────────────────────

subcriber.subscribe(channels.lobby.created, channels.lobby.events);
subcriber.psubscribe(channels.lobby.statsPattern);

const redisRouter = new RedisRouter();

subcriber.on("message", (channel, message) =>
	redisRouter.dispatchMessage(channel, message),
);

subcriber.on("pmessage", (pattern, channel, message) =>
	redisRouter.dispatchPmessage(pattern, channel, message),
);

redisRouter
	.on(channels.lobby.created, (payload) => {
		broadcast("lobbies", { event: "lobby:created", data: payload });
	})

	.on(channels.lobby.events, (payload) => {
		broadcast("lobbies", { event: `lobby:${payload.type}`, data: payload });
		if (payload.lobbyId) {
			broadcast(`lobby:${payload.lobbyId}`, {
				event: `lobby:${payload.type}`,
				data: payload,
			});
		}
	})
	.onPattern(channels.lobby.statsPattern, (channel, payload) => {
		const lobbyId = channel.split(":")[2];
		broadcast(`lobby:${lobbyId}`, { event: "lobby:stats", data: payload });
	});

// ── Routes ───────────────────────────────────────────────────────────────────

app.route("/", httpRouter);
app.route("/ws", websocketRouter);

export default {
	fetch: app.fetch,
	websocket,
};
