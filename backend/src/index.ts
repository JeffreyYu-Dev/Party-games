import { Hono } from "hono";
import { generateCode } from "./utils";

const app = new Hono();

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

type room = {
	id: string;
};

const rooms = new Map<string, room>();

app.post("api/rooms/create", async (c) => {
	// TODO: add verfication that it's a minecraft player and online

	const code = generateCode();

	return c.json({
		code,
	});
});

app.post("api/rooms/join", async (c) => {
	const { code } = await c.req.json();

	console.log(code);

	return c.text("joined");
});
app.post("api/rooms/leave", async (c) => {});

export default app;
