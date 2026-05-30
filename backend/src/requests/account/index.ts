import { db } from "#/services/db/db";
import { usersTable } from "#/services/db/schemas";

type upsertUserArgsType = {
	id: string;
	username: string;
};

export const upsertUserAccount = async ({
	id,
	username,
}: upsertUserArgsType) => {
	const user: typeof usersTable.$inferInsert = {
		id,
		username,
	};

	const [result] = await db
		.insert(usersTable)
		.values(user)
		.onConflictDoUpdate({
			target: usersTable.id,
			// if ever they change their username
			set: {
				username: user.username,
			},
		})
		.returning();

	if (!result) {
		//TODO: if there is no result what do we do but like this is almost impossible
	}

	return result;
};

export const getAccount = async (id: string) => {
	return await db.query.usersTable.findFirst({
		where: {
			id,
		},
	});
};

export const getAccountByUsername = async (username: string) => {
	return await db.query.usersTable.findFirst({
		where: {
			username,
		},
	});
};
