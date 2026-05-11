type CreateLobbyBody = {
	name: string;
	map: string;
	playerCap: number;
};

type DeleteLobbyBody = {
	id: string;
};

type EditLobbyBody = {
	id: string;
	name: string;
};

export type { CreateLobbyBody, DeleteLobbyBody, EditLobbyBody };
