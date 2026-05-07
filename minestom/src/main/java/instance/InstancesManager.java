package instance;

import lobby.LobbyManager;

public class InstancesManager {
    private final LobbyManager lobbyManager;

    public InstancesManager(LobbyManager lobbyManager) {
        this.lobbyManager = lobbyManager;
    }

    public LobbyManager getLobbyManager() {
        return lobbyManager;
    }
}
