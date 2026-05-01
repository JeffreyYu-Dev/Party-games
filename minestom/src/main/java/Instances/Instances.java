package Instances;

import Instances.Lobby.LobbyManager;
import Instances.Rooms.RoomManager;

public class Instances {
    private static LobbyManager lobbyManager;
    private static RoomManager roomManager;

    public static void init(LobbyManager lm, RoomManager rm) {
        lobbyManager = lm;
        roomManager = rm;
    }

    public static LobbyManager getLobbyManager() {
        return lobbyManager;
    }

    public static RoomManager getRoomManager() {
        return roomManager;
    }
}
