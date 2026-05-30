import { z } from "zod";

const createEnv = () => {
	const envSchema = z.object({
		redisURL: z.string(),
		databaseURL: z.string(),
		minestomURL: z.string(),
		internalSecret: z.string(),
	});

	const { success, data } = envSchema.safeParse({
		redisURL: Bun.env.REDIS_CONNECTION_STRING,
		databaseURL: Bun.env.DATABASE_URL,
		minestomURL: Bun.env.MINESTOM_URL,
		internalSecret: Bun.env.INTERNAL_SECRET,
	});

	if (!success) {
		throw new Error("Invalid env");
	}

	return data ?? {};
};

export const env = createEnv();
