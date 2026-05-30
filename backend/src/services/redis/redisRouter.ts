type Payload = Record<string, unknown>;
type ChannelHandler = (payload: Payload) => void;
type PatternHandler = (channel: string, payload: Payload) => void;

class RedisRouter {
	private channelHandlers = new Map<string, ChannelHandler[]>();
	private eventHandlers = new Map<string, Map<string, ChannelHandler[]>>();
	private pmessageHandlers: Array<{
		pattern: string;
		handler: PatternHandler;
	}> = [];

	on(channel: string, handler: ChannelHandler) {
		if (!this.channelHandlers.has(channel))
			this.channelHandlers.set(channel, []);
		this.channelHandlers.get(channel)?.push(handler);
		return this;
	}

	onEvent(channel: string, type: string, handler: ChannelHandler) {
		if (!this.eventHandlers.has(channel))
			this.eventHandlers.set(channel, new Map());
		const map = this.eventHandlers.get(channel);
		if (!map) return this;
		if (!map.has(type)) map.set(type, []);
		map.get(type)?.push(handler);
		return this;
	}

	onPattern(pattern: string, handler: PatternHandler) {
		this.pmessageHandlers.push({ pattern, handler });
		return this;
	}

	dispatchMessage(channel: string, raw: string) {
		const payload = JSON.parse(raw) as Payload;
		for (const h of this.channelHandlers.get(channel) ?? []) h(payload);
		if (typeof payload.type === "string") {
			const handlers = this.eventHandlers.get(channel)?.get(payload.type) ?? [];
			for (const h of handlers) h(payload);
		}
	}

	dispatchPmessage(pattern: string, channel: string, raw: string) {
		const payload = JSON.parse(raw) as Payload;
		for (const { pattern: p, handler } of this.pmessageHandlers) {
			if (p === pattern) handler(channel, payload);
		}
	}
}

export { RedisRouter };
