import { db } from "#/services/db/db";
import {
	blocksTable,
	friendRequestsTable,
	friendsTable,
} from "#/services/db/schemas";
import { and, eq, or } from "drizzle-orm";

export const getFriendsList = async (userId: string) => {
	return await db.query.friendsTable.findMany({
		where: { userId },
		columns: { createdAt: false },
	});
};

export const getFriendsWithUsernames = async (userId: string) => {
	const rows = await db.query.friendsTable.findMany({
		where: { userId },
		columns: { friendId: true },
		with: { friend: { columns: { username: true } } },
	});
	return rows.map((r) => ({ id: r.friendId, username: r.friend.username }));
};

type FriendRequestArgs = {
	requesterId: string;
	receiverId: string;
};

export const makeFriendRequest = async ({
	requesterId,
	receiverId,
}: FriendRequestArgs) => {
	const [result] = await db
		.insert(friendRequestsTable)
		.values({ requesterId, receiverId })
		.returning();

	return result;
};

export const getFriendRequest = async ({
	requesterId,
	receiverId,
}: FriendRequestArgs) => {
	return await db.query.friendRequestsTable.findFirst({
		where: { requesterId, receiverId },
		columns: { createdAt: false },
	});
};

export const getPendingFriendRequests = async (userId: string) => {
	return await db.query.friendRequestsTable.findMany({
		where: { receiverId: userId },
		columns: { createdAt: false },
	});
};

export const acceptFriendRequest = async ({
	requesterId,
	receiverId,
}: FriendRequestArgs) => {
	const [fromRequester] = await db
		.insert(friendsTable)
		.values({ userId: requesterId, friendId: receiverId })
		.returning();

	const [fromReceiver] = await db
		.insert(friendsTable)
		.values({ userId: receiverId, friendId: requesterId })
		.returning();

	if (!fromRequester || !fromReceiver) {
		await db
			.delete(friendsTable)
			.where(
				and(
					eq(friendsTable.userId, requesterId),
					eq(friendsTable.friendId, receiverId),
				),
			);
		await db
			.delete(friendsTable)
			.where(
				and(
					eq(friendsTable.userId, receiverId),
					eq(friendsTable.friendId, requesterId),
				),
			);
		return null;
	}

	await db
		.delete(friendRequestsTable)
		.where(
			and(
				eq(friendRequestsTable.requesterId, requesterId),
				eq(friendRequestsTable.receiverId, receiverId),
			),
		);

	return { fromRequester, fromReceiver };
};

export const removeFriendRequest = async ({
	requesterId,
	receiverId,
}: FriendRequestArgs) => {
	const [deletedRow] = await db
		.delete(friendRequestsTable)
		.where(
			and(
				eq(friendRequestsTable.requesterId, requesterId),
				eq(friendRequestsTable.receiverId, receiverId),
			),
		)
		.returning();

	return deletedRow;
};

export const removeFriend = async ({
	userId,
	friendId,
}: {
	userId: string;
	friendId: string;
}) => {
	await db
		.delete(friendsTable)
		.where(
			or(
				and(
					eq(friendsTable.userId, userId),
					eq(friendsTable.friendId, friendId),
				),
				and(
					eq(friendsTable.userId, friendId),
					eq(friendsTable.friendId, userId),
				),
			),
		);
};

export const blockUser = async ({
	blockerId,
	blockedId,
}: {
	blockerId: string;
	blockedId: string;
}) => {
	await removeFriend({ userId: blockerId, friendId: blockedId });

	await db
		.delete(friendRequestsTable)
		.where(
			or(
				and(
					eq(friendRequestsTable.requesterId, blockerId),
					eq(friendRequestsTable.receiverId, blockedId),
				),
				and(
					eq(friendRequestsTable.requesterId, blockedId),
					eq(friendRequestsTable.receiverId, blockerId),
				),
			),
		);

	const [result] = await db
		.insert(blocksTable)
		.values({ blockerId, blockedId })
		.onConflictDoNothing()
		.returning();

	return result;
};

export const unblockUser = async ({
	blockerId,
	blockedId,
}: {
	blockerId: string;
	blockedId: string;
}) => {
	const [result] = await db
		.delete(blocksTable)
		.where(
			and(
				eq(blocksTable.blockerId, blockerId),
				eq(blocksTable.blockedId, blockedId),
			),
		)
		.returning();

	return result;
};

export const getBlockedUsers = async (userId: string) => {
	return await db.query.blocksTable.findMany({
		where: { blockerId: userId },
		columns: { createdAt: false },
	});
};
