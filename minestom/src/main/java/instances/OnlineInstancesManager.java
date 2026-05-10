package instances;

import net.minestom.server.MinecraftServer;

import java.util.*;

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

    public static Lobby getLobby(UUID id) {
        return lobbies.get(id);
    }


    public static Lobby removeLobby(UUID id) {
        if (lobbies.size() <= 1) {
            return null;
        }

        Lobby lobby = lobbies.remove(id);
        if (lobby == null) return null;

        Lobby fallback = lobbies.values().iterator().next();
        lobby.getInstance().getPlayers().forEach(player -> player.setInstance(fallback.getInstance(), fallback.getSpawn()));

        MinecraftServer.getInstanceManager().unregisterInstance(lobby.getInstance());
        
        return lobby;
    }


    public static List<Lobby> getLobbies() {
        return lobbies.values().stream().toList();
    }


    public static void createGame() {

    }

    public static void createParty() {

    }


}

