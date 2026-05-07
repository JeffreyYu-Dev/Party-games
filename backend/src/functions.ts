import { publisher, channels, subcriber } from "./services/redis";

function createLobby() {
	const body = {
		action: "create",
	};

	publisher.publish(channels.lobby.publish.create, JSON.stringify(body));
}

function editLobby() {
	// what can we change about the lobby details
	const body = {
		name: "",
	};

	publisher.publish(channels.lobby.publish.edit(""), JSON.stringify(body));
}

function deleteLobby() {
	const body = {};

	publisher.publish(channels.lobby.publish.delete(""), JSON.stringify(body));
}
