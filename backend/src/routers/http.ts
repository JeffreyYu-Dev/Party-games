import {
	getAccount,
	getAccountByUsername,
	upsertUserAccount,
} from "#/requests/account";
import { env } from "#/config/env";
import { publisher, channels } from "#/services/redis/redis";
import {
	acceptFriendRequest,
	blockUser,
	getFriendRequest,
	getFriendsList,
	getFriendsWithUsernames,
	getBlockedUsers,
	getPendingFriendRequests,
	makeFriendRequest,
	removeFriend,
	removeFriendRequest,
	unblockUser,
} from "#/requests/friends";
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.text("Hello Hono!"));

app.use("/friends/*", async (c, next) => {
	const secret = c.req.header("X-Internal-Secret");
	if (secret !== env.internalSecret) {
		return c.text("unauthorized", 401);
	}
	await next();
});

app.post("/account", async (c) => {
	const { id, username } = await c.req.json();

	const userRes = await upsertUserAccount({
		id,
		username,
	});

	const friendsRes = await getFriendsList(userRes.id);

	return c.json(friendsRes);
});

app.get("/account/:id", async (c) => {
	const { id } = c.req.param();

	const accountRes = await getAccount(id);

	return c.json(accountRes);
});

app.get("/account/username/:username", async (c) => {
	const { username } = c.req.param();

	const accountRes = await getAccountByUsername(username);

	if (!accountRes) {
		return c.text("user not found", 404);
	}

	return c.json(accountRes);
});

// make friend request
// accept friend request
// decline friend request
// block friend

// list friends

app.post("/friends/request", async (c) => {
	const { requesterId, receiverId } = await c.req.json();

	if (requesterId === receiverId) {
		return c.text("cannot send a friend request to yourself", 400);
	}

	// we need to check if they tried to friend them before

	const friendRequest = await getFriendRequest({ requesterId, receiverId });

	if (friendRequest) {
		return c.json(friendRequest);
	}

	const res = await makeFriendRequest({ requesterId, receiverId });

	const requester = await getAccount(requesterId);
	publisher.publish(
		channels.friend.request,
		JSON.stringify({
			requesterId,
			receiverId,
			requesterName: requester?.username,
		}),
	);

	return c.json(res);
});

app.get("/friends/request/:id", async (c) => {
	const { id } = c.req.param();

	// return all pending friend requests
	return c.json(await getPendingFriendRequests(id));
});

app.post("/friends/accept", async (c) => {
	const { requesterId, receiverId } = await c.req.json();

	const friendRequest = await getFriendRequest({ requesterId, receiverId });

	if (!friendRequest) {
		return c.text("no friend request", 404);
	}

	const result = await acceptFriendRequest({ requesterId, receiverId });

	if (!result) {
		return c.text("could not add users", 500);
	}

	return c.json({ requesterId, receiverId });
});

app.post("/friends/decline", async (c) => {
	const { requesterId, receiverId } = await c.req.json();

	// remove the friend request from the table
	const res = await removeFriendRequest({ requesterId, receiverId });

	return c.json(res);
});

app.post("/friends/block", async (c) => {
	const { blockerId, blockedId } = await c.req.json();

	const result = await blockUser({ blockerId, blockedId });

	return c.json(result ?? null);
});

app.post("/friends/unblock", async (c) => {
	const { blockerId, blockedId } = await c.req.json();

	const result = await unblockUser({ blockerId, blockedId });

	if (!result) {
		return c.text("no block found", 404);
	}

	return c.json(result);
});

app.get("/friends/block/:id", async (c) => {
	const { id } = c.req.param();

	return c.json(await getBlockedUsers(id));
});

app.delete("/friends/:id", async (c) => {
	const { id: friendId } = c.req.param();
	const { userId } = await c.req.json();

	await removeFriend({ userId, friendId });

	return c.json({ userId, friendId });
});

app.get("/friends", async (c) => {
	const userId = c.req.query("userId");

	if (!userId) {
		return c.text("userId query param required", 400);
	}

	return c.json(await getFriendsList(userId));
});

app.get("/friends/list/:userId", async (c) => {
	const { userId } = c.req.param();
	return c.json(await getFriendsWithUsernames(userId));
});

export default app;
