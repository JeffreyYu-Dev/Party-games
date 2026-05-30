import { defineRelations } from "drizzle-orm/relations";
import { usersTable, friendsTable, friendRequestsTable, blocksTable } from "./schemas";

export const relations = defineRelations(
	{ usersTable, friendsTable, friendRequestsTable, blocksTable },
	(r) => ({
		usersTable: {
			friends: r.many.friendsTable({
				from: r.usersTable.id,
				to: r.friendsTable.userId,
			}),
			friendOf: r.many.friendsTable({
				from: r.usersTable.id,
				to: r.friendsTable.friendId,
			}),
			sentRequests: r.many.friendRequestsTable({
				from: r.usersTable.id,
				to: r.friendRequestsTable.requesterId,
			}),
			receivedRequests: r.many.friendRequestsTable({
				from: r.usersTable.id,
				to: r.friendRequestsTable.receiverId,
			}),
			blocking: r.many.blocksTable({
				from: r.usersTable.id,
				to: r.blocksTable.blockerId,
			}),
			blockedBy: r.many.blocksTable({
				from: r.usersTable.id,
				to: r.blocksTable.blockedId,
			}),
		},
		friendsTable: {
			user: r.one.usersTable({
				from: r.friendsTable.userId,
				to: r.usersTable.id,
			}),
			friend: r.one.usersTable({
				from: r.friendsTable.friendId,
				to: r.usersTable.id,
			}),
		},
		friendRequestsTable: {
			requester: r.one.usersTable({
				from: r.friendRequestsTable.requesterId,
				to: r.usersTable.id,
			}),
			receiver: r.one.usersTable({
				from: r.friendRequestsTable.receiverId,
				to: r.usersTable.id,
			}),
		},
		blocksTable: {
			blocker: r.one.usersTable({
				from: r.blocksTable.blockerId,
				to: r.usersTable.id,
			}),
			blocked: r.one.usersTable({
				from: r.blocksTable.blockedId,
				to: r.usersTable.id,
			}),
		},
	}),
);
