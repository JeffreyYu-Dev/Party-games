package lobby;

import instance.InstanceType;
import manager.Manager;
import net.minestom.server.coordinate.Pos;
import net.minestom.server.instance.InstanceContainer;
import net.minestom.server.instance.InstanceManager;
import net.minestom.server.instance.anvil.AnvilLoader;
import utils.dto.worlds.WorldMap;

import java.util.Comparator;

public class LobbyManager extends Manager<Lobby> {

    public LobbyManager(InstanceManager instanceManager) {
        super(instanceManager);
    }

    public Lobby createLobby(String name, int playerCap) {
        WorldMap worldMap = getWorldMap("lobby", InstanceType.LOBBY);

        InstanceContainer container = getInstanceManager().createInstanceContainer();
        AnvilLoader loader = loadMap("lobby", InstanceType.LOBBY);
        if (loader != null) {
            container.setChunkLoader(loader);
        }

        Pos spawn = worldMap != null ? worldMap.getSpawn().toPos() : Pos.ZERO;

        try {
            Lobby lobby = new Lobby(name, playerCap, spawn, container);
            register(lobby);
            return lobby;
        } catch (Exception e) {
            System.err.println("Failed to create lobby '" + name + "': " + e.getMessage());
            return null;
        }
    }


    public Lobby getLobby(String name) {
        return getAll().values().stream()
                .filter(l -> l.getName().equals(name))
                .findFirst()
                .orElse(null);
    }

    public Lobby getLeastPopulatedLobby() {
        return getAll().values().stream()
                .min(Comparator.comparingInt(Lobby::getNumberOfPlayers))
                .orElse(null);
    }
}
