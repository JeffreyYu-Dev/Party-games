import type { WSMessageReceive } from "hono/ws";
import { z } from "zod";

const actions = {
	subscribe: "subscribe",
	unsubscribe: "unsubscribe",
	lobby: {
		create: "lobby:create",
		delete: "lobby:delete",
		edit: "lobby:edit",
		kick: "lobby:kick",
		move: "lobby:move",
		get: "lobby:get",
		all: "lobby:getAll",
	},
} as const;

const incomingMessageSchema = z.object({
	action: z.string(),
	body: z.unknown(),
});

type Handler = (body: z.infer<typeof incomingMessageSchema>) => void;

class WebsocketRouter {
	private handlers = new Map<string, Handler>();

	on(action: string, handler: Handler) {
		this.handlers.set(action, handler);
		return this;
	}

	dispatch(msg: WSMessageReceive) {
		const parsed = JSON.parse(msg.toString());

		const { success, data } = incomingMessageSchema.safeParse(parsed);
		if (!success) throw new Error("invalid schema");

		const handler = this.handlers.get(data.action);
		if (!handler) throw new Error("No handlers");

		handler(data);
	}
}

export { actions, WebsocketRouter };
