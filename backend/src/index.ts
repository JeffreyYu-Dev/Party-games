import { Hono } from "hono";
import { upgradeWebSocket, websocket } from "hono/bun";

const app = new Hono();

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

app.get(
	"/ws",
	upgradeWebSocket((c) => {
		return {
			onMessage(event, ws) {
				console.log(event.data);
				// create event handler that will parse actions then pass them on the action handlers
				ws.send("Hello from server!");
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
