import { z } from "zod";

const createEnv = () => {
	const envSchema = z.object({
		redisConnectionString: z.string(),
		minestomURL: z.string(),
	});

	const { success, data } = envSchema.safeParse({
		redisConnectionString: Bun.env.REDIS_CONNECTION_STRING,
		minestomURL: Bun.env.MINESTOM_URL,
	});

	if (!success) {
		throw new Error("Invalid env");
	}

	return data ?? {};
};

export const env = createEnv();
