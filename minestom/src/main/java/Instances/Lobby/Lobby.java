package Instances.Lobby;


import Instances.Instance;
import Instances.InstanceType;
import net.minestom.server.coordinate.Pos;
import net.minestom.server.instance.InstanceContainer;


public class Lobby extends Instance {
    public Lobby(String name, int playerCap, Pos spawnPosition, InstanceContainer lobby) throws Exception {
        super(name, playerCap, lobby, spawnPosition, InstanceType.LOBBY);
    }
}
