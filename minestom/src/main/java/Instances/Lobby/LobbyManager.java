package Instances.Lobby;

import net.minestom.server.coordinate.Pos;
import net.minestom.server.entity.Player;
import net.minestom.server.instance.InstanceContainer;
import net.minestom.server.instance.InstanceManager;
import net.minestom.server.instance.block.Block;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class LobbyManager {
    private final InstanceManager instanceManager;

    private final Map<String, Lobby> lobbies = new HashMap<>();

    public LobbyManager(InstanceManager manager) {
        this.instanceManager = manager;
    }


    public void createLobby(String lobbyName) {
        Lobby lobby = createTempLobbyWorld(lobbyName);
        lobbies.put(lobbyName, lobby);
    }

    public void joinLobby(Player player, String lobbyName) {
        InstanceContainer lobby = lobbies.get(lobbyName).getLobby();
//        check if the player is already in the lobby

        boolean isPlayerInLobby = lobby.getPlayers().stream().anyMatch(plr -> plr.getUuid() == player.getUuid());

        if (isPlayerInLobby) {
            return;
        }
        
        player.setInstance(lobbies.get(lobbyName).getLobby(), new Pos(0, 42, 0));
    }


    private Lobby createTempLobbyWorld(String lobbyName) {
        InstanceContainer lobby = instanceManager.createInstanceContainer();

//    TODO:    CHANGE
        lobby.setGenerator(unit -> unit.modifier().fillHeight(0, 40, Block.GRASS_BLOCK));
        // TODO: generate lobby names automatically
        return new Lobby(lobby, lobbyName, UUID.randomUUID(), 40);
    }

    public InstanceContainer getFirstLobby() {
        return lobbies.get("Lobby-1").getLobby();
    }

}