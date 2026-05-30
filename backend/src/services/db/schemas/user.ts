import {
	pgTable,
	uuid,
	varchar,
	timestamp,
	primaryKey,
	index,
	check,
} from "drizzle-orm/pg-core";
import { sql, defineRelations } from "drizzle-orm";

import { createdAt } from "../helpers";

export const usersTable = pgTable(
	"users",
	{
		id: uuid("id").primaryKey(),
		username: varchar("username", { length: 16 }).notNull(),
		createdAt,
		lastSeenAt: timestamp("last_seen_at").notNull().defaultNow(),
	},
	(table) => [index("users_username_idx").on(table.username)],
);

export const friendsTable = pgTable(
	"friends",
	{
		userId: uuid("user_id")
			.notNull()
			.references(() => usersTable.id, { onDelete: "cascade" }),
		friendId: uuid("friend_id")
			.notNull()
			.references(() => usersTable.id, { onDelete: "cascade" }),
		createdAt,
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.friendId] }),
		index("friends_friend_idx").on(table.friendId),
		check("no_self_friend", sql`${table.userId} <> ${table.friendId}`),
	],
);

export const friendRequestsTable = pgTable(
	"friend_requests",
	{
		requesterId: uuid("requester_id")
			.notNull()
			.references(() => usersTable.id, { onDelete: "cascade" }),
		receiverId: uuid("receiver_id")
			.notNull()
			.references(() => usersTable.id, { onDelete: "cascade" }),
		createdAt,
	},
	(table) => [
		primaryKey({ columns: [table.requesterId, table.receiverId] }),
		index("friend_requests_receiver_idx").on(table.receiverId),
		check("no_self_request", sql`${table.requesterId} <> ${table.receiverId}`),
	],
);

export const blocksTable = pgTable(
	"blocks",
	{
		blockerId: uuid("blocker_id")
			.notNull()
			.references(() => usersTable.id, { onDelete: "cascade" }),
		blockedId: uuid("blocked_id")
			.notNull()
			.references(() => usersTable.id, { onDelete: "cascade" }),
		createdAt,
	},
	(table) => [
		primaryKey({ columns: [table.blockerId, table.blockedId] }),
		index("blocks_blocked_idx").on(table.blockedId),
		check("no_self_block", sql`${table.blockerId} <> ${table.blockedId}`),
	],
);
