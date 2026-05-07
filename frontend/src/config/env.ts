import { z } from "zod";

const createEnv = () => {
	const envSchema = z.object({});

	const { success, data } = envSchema.safeParse({});

	if (!success) {
		throw new Error("Invalid env");
	}

	return data ?? {};
};

export const env = createEnv();
