import { Hono } from "hono";
import { upgradeWebSocket, websocket } from "hono/bun";
import { actions, WebsocketRouter } from "./websocketRouter";
import { createLobby, deleteLobby, editLobby } from "./functions";
import type { CreateLobbyBody, DeleteLobbyBody, EditLobbyBody } from "./types";

const app = new Hono();

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

// TODO: how does the realtime updates work?
// when the page loads the frontend will tell the api to subscribe it's events

app.get(
	"/ws",
	upgradeWebSocket((c) => {
		return {
			onMessage(event, ws) {
				const websocketRouter = new WebsocketRouter();

				websocketRouter.on(actions.lobby.create, async (msg) => {
					const { name, map, playerCap } = msg.body as CreateLobbyBody;

					const res = await createLobby(name, map, playerCap);

					// TODO: create standard response and fix up how to respond
					if (!res.ok) {
						ws.send("Could not create lobby");
						return;
					}

					ws.send(JSON.stringify(await res.json()));
				});

				websocketRouter.on(actions.lobby.delete, async (msg) => {
					const { id } = msg.body as DeleteLobbyBody;

					const res = await deleteLobby(id);

					if (!res.ok) {
						ws.send("could not delete lobby");
						return;
					}

					ws.send(JSON.stringify(await res.json()));
				});

				websocketRouter.on(actions.lobby.edit, async (msg) => {
					const { id, name } = msg.body as EditLobbyBody;

					const res = await editLobby(id, name);

					if (!res.ok) {
						ws.send("could not edit lobby");
						return;
					}

					ws.send(JSON.stringify(res.json()));
				});

				try {
					websocketRouter.dispatch(event.data);
				} catch (err) {
					if (err instanceof Error) {
						ws.send(err.message);
					}
				}
			},
			onClose: () => {
				console.log("Connection closed");
			},
		};
	}),
);

export default {
	fetch: app.fetch,
	websocket,
};
