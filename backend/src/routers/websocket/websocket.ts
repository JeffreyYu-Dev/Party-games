import {
	createLobby,
	deleteLobby,
	editLobby,
	getLobbies,
	getLobby,
	kickPlayer,
	movePlayer,
} from "#/requests/functions";
import type {
	CreateLobbyBody,
	DeleteLobbyBody,
	EditLobbyBody,
} from "#/types/types";
import { actions, WebsocketRouter } from "#/routers/websocket/websocketRouter";
import { Hono } from "hono";
import { upgradeWebSocket } from "hono/bun";

import type { WSContext } from "hono/ws";

const app = new Hono();

type Client = { ws: WSContext; subscriptions: Set<string> };
const clients = new Map<string, Client>();

// ── Client registry ──────────────────────────────────────────────────────────

export function broadcast(subscription: string, msg: object) {
	const raw = JSON.stringify(msg);
	for (const client of clients.values()) {
		if (client.subscriptions.has(subscription)) {
			client.ws.send(raw);
		}
	}
}

app.get(
	"/",
	upgradeWebSocket((c) => {
		const clientId = crypto.randomUUID();
		const router = new WebsocketRouter();

		return {
			onOpen(_event, ws) {
				const client: Client = { ws, subscriptions: new Set() };
				clients.set(clientId, client);

				router
					.on(actions.subscribe, (msg) => {
						const { channel, lobbyId } = msg.body as {
							channel: string;
							lobbyId?: string;
						};
						const key =
							channel === "lobby" && lobbyId ? `lobby:${lobbyId}` : "lobbies";
						client.subscriptions.add(key);
					})
					.on(actions.unsubscribe, (msg) => {
						const { channel, lobbyId } = msg.body as {
							channel: string;
							lobbyId?: string;
						};
						const key =
							channel === "lobby" && lobbyId ? `lobby:${lobbyId}` : "lobbies";
						client.subscriptions.delete(key);
					})
					.on(actions.lobby.create, async (msg) => {
						const { name, map, playerCap } = msg.body as CreateLobbyBody;
						const res = await createLobby(name, map, playerCap);
						if (!res.ok) {
							ws.send("Could not create lobby");
							return;
						}
						ws.send(JSON.stringify(await res.json()));
					})
					.on(actions.lobby.delete, async (msg) => {
						const { id } = msg.body as DeleteLobbyBody;
						const res = await deleteLobby(id);
						if (!res.ok) {
							ws.send("could not delete lobby");
							return;
						}
						ws.send(JSON.stringify(await res.json()));
					})
					.on(actions.lobby.edit, async (msg) => {
						const { id, name } = msg.body as EditLobbyBody;
						const res = await editLobby(id, name);
						if (!res.ok) {
							ws.send("could not edit lobby");
							return;
						}
						ws.send(JSON.stringify(await res.json()));
					})
					.on(actions.lobby.kick, async (msg) => {
						const { lobbyId, playerId } = msg.body as {
							lobbyId: string;
							playerId: string;
						};
						const res = await kickPlayer(lobbyId, playerId);
						if (!res.ok) {
							ws.send(JSON.stringify({ error: "could not kick player" }));
						}
					})
					.on(actions.lobby.move, async (msg) => {
						const { lobbyId, playerId, targetLobbyId } = msg.body as {
							lobbyId: string;
							playerId: string;
							targetLobbyId: string;
						};
						const res = await movePlayer(lobbyId, playerId, targetLobbyId);
						if (!res.ok) {
							ws.send(JSON.stringify({ error: "could not move player" }));
						}
					})
					.on(actions.lobby.get, async (msg) => {
						const { lobbyId, requestId } = msg.body as {
							lobbyId: string;
							requestId: string;
						};
						try {
							const res = await getLobby(lobbyId);
							ws.send(
								JSON.stringify({
									event: "lobby:get:response",
									data: { requestId, result: await res.json() },
								}),
							);
						} catch {
							ws.send(
								JSON.stringify({
									event: "lobby:get:response",
									data: { requestId, result: null },
								}),
							);
						}
					})
					.on(actions.lobby.all, async (msg) => {
						const { requestId } = msg.body as { requestId: string };
						try {
							const res = await getLobbies();
							ws.send(
								JSON.stringify({
									event: "lobby:getAll:response",
									data: { requestId, result: await res.json() },
								}),
							);
						} catch {
							ws.send(
								JSON.stringify({
									event: "lobby:getAll:response",
									data: { requestId, result: [] },
								}),
							);
						}
					});
			},

			onMessage(event) {
				try {
					router.dispatch(event.data);
				} catch (err) {
					if (err instanceof Error) {
						clients.get(clientId)?.ws.send(err.message);
					}
				}
			},

			onClose() {
				clients.delete(clientId);
				console.log("Connection closed");
			},
		};
	}),
);

export default app;
