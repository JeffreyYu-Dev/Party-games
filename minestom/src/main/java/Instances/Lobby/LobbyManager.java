package Instances.Lobby;

import Instances.Instance;
import net.minestom.server.coordinate.Pos;
import net.minestom.server.entity.Player;
import net.minestom.server.instance.InstanceContainer;
import net.minestom.server.instance.InstanceManager;
import net.minestom.server.instance.block.Block;

import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;

public class LobbyManager {
    private final InstanceManager instanceManager;

    private final Map<String, Lobby> lobbies = new HashMap<>();

    public LobbyManager(InstanceManager manager) {
        this.instanceManager = manager;
    }

    public void createLobby(String lobbyName, Pos spawnPosition, int size) {
        InstanceContainer lobby = instanceManager.createInstanceContainer();
        //    TODO:    CHANGE
        lobby.setGenerator(unit -> unit.modifier().fillHeight(0, 40, Block.GRASS_BLOCK));

//        FIXME: maybe throw exception
        if (lobbies.containsKey(lobbyName)) {
            return;
        }

        try {
            lobbies.put(lobbyName, new Lobby(lobbyName, size, spawnPosition, lobby));
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }

    public Lobby getLobby(String lobbyName) {
        return this.lobbies.get(lobbyName);
    }

    // join any available lobby
    public void join(Player plr) {
        Lobby lobby = getLeastPopulatedLobby();
        lobby.join(plr);
    }


    public Lobby getLeastPopulatedLobby() {
        return this.lobbies.values().stream().filter(l -> l.getNumberOfPlayers() < l.getPlayerCap())
                .min(Comparator.comparingInt(Instance::getNumberOfPlayers))
                .orElse(null);
    }

}