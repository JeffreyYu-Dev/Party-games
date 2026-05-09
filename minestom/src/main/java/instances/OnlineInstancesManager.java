package instances;

import java.util.HashMap;
import java.util.List;
import java.util.UUID;

public class OnlineInstancesManager {
    private static final HashMap<UUID, Lobby> lobbies = new HashMap<>();
    private static final HashMap<UUID, OnlineInstance> games = new HashMap<>();
    private static final HashMap<UUID, OnlineInstance> parties = new HashMap<>();

    public static OnlineInstance createLobby(String name, int playerCap, String map) {
        Lobby lobby = new Lobby(name, playerCap);
        try {
            lobby.setMap(map);
            lobbies.put(lobby.getId(), lobby);
        } catch (NullPointerException e) {
            System.out.println("map doesn't exist");
        }

        return lobby;
    }

    public static Lobby getLobby(UUID lobby) {
        return lobbies.get(lobby);
    }

    public static List<Lobby> getLobbies() {
        return lobbies.values().stream().toList();
    }


    public static void createGame() {

    }

    public static void createParty() {

    }


}

