package Instances.Lobby;


import net.minestom.server.instance.InstanceContainer;

import java.util.UUID;

public class Lobby {
    private final String name;
    private final UUID lobbyId;
    private final int playerCap;
//    this should maybe hold the world?

    private final InstanceContainer worldLobby;

    public Lobby(InstanceContainer instance, String name, UUID lobbyId, int playerCap) {
        this.worldLobby = instance;
        this.name = name;
        this.lobbyId = lobbyId;
        this.playerCap = playerCap;
    }

    public InstanceContainer getLobby() {
        return worldLobby;
    }


    //    get world name? destroy? cleanup?

}
