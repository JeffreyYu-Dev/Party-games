import * as React from "react";
import { env } from "#/config/env";

type Handler = (data: unknown) => void;

class WsClient {
	private ws: WebSocket | null = null;
	private handlers = new Map<string, Set<Handler>>();
	private activeSubs = new Set<string>();
	private pendingQueue: object[] = [];

	connect() {
		if (
			this.ws &&
			(this.ws.readyState === WebSocket.OPEN ||
				this.ws.readyState === WebSocket.CONNECTING)
		)
			return;

		this.ws = new WebSocket(env.wsUrl);

		this.ws.onopen = () => {
			for (const msg of this.pendingQueue.splice(0)) {
				this.ws!.send(JSON.stringify(msg));
			}
			for (const key of this.activeSubs) {
				this.ws!.send(JSON.stringify(subKeyToMessage("subscribe", key)));
			}
		};

		this.ws.onmessage = (e) => {
			const msg = JSON.parse(e.data as string);
			if (msg.event) {
				this.handlers.get(msg.event)?.forEach((h) => h(msg.data));
			}
		};

		this.ws.onclose = () => {
			setTimeout(() => this.connect(), 2000);
		};
	}

	send(action: string, body: unknown) {
		this.sendRaw({ action, body });
	}

	request<T>(action: string, body: Record<string, unknown> = {}): Promise<T> {
		const requestId = crypto.randomUUID();

		return new Promise<T>((resolve, reject) => {
			let timeoutId: ReturnType<typeof setTimeout>;

			const off = this.on(`${action}:response`, (data) => {
				const resp = data as { requestId: string; result: T };
				if (resp.requestId !== requestId) return;
				clearTimeout(timeoutId);
				off();
				resolve(resp.result);
			});

			timeoutId = setTimeout(() => {
				off();
				reject(new Error(`ws timeout: ${action}`));
			}, 10_000);

			this.sendRaw({ action, body: { ...body, requestId } });
		});
	}

	private sendRaw(msg: object) {
		if (this.ws?.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(msg));
		} else {
			this.pendingQueue.push(msg);
			this.connect();
		}
	}

	on(event: string, handler: Handler) {
		if (!this.handlers.has(event)) this.handlers.set(event, new Set());
		this.handlers.get(event)!.add(handler);
		return () => this.handlers.get(event)?.delete(handler);
	}

	subscribe(channel: "lobbies"): void;
	subscribe(channel: "lobby", lobbyId: string): void;
	subscribe(channel: string, lobbyId?: string) {
		const key = lobbyId ? `lobby:${lobbyId}` : "lobbies";
		this.activeSubs.add(key);
		if (this.ws?.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(subKeyToMessage("subscribe", key)));
		} else {
			this.connect();
		}
	}

	unsubscribe(channel: "lobbies"): void;
	unsubscribe(channel: "lobby", lobbyId: string): void;
	unsubscribe(channel: string, lobbyId?: string) {
		const key = lobbyId ? `lobby:${lobbyId}` : "lobbies";
		this.activeSubs.delete(key);
		if (this.ws?.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(subKeyToMessage("unsubscribe", key)));
		}
	}
}

function subKeyToMessage(action: string, key: string) {
	if (key === "lobbies") return { action, body: { channel: "lobbies" } };
	const lobbyId = key.slice("lobby:".length);
	return { action, body: { channel: "lobby", lobbyId } };
}

export const wsClient = new WsClient();

export function useWsEvent<T = unknown>(
	event: string,
	handler: (data: T) => void,
) {
	const handlerRef = React.useRef(handler);
	handlerRef.current = handler;

	React.useEffect(() => {
		return wsClient.on(event, (data) => handlerRef.current(data as T));
	}, [event]);
}
