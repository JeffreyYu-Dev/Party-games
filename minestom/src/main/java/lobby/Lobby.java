package lobby;

import instance.Instance;
import instance.InstanceType;
import net.minestom.server.coordinate.Pos;
import net.minestom.server.entity.Player;
import net.minestom.server.instance.InstanceContainer;

public class Lobby extends Instance {

    public Lobby(String name, int playerCap, Pos spawnPosition, InstanceContainer container) throws Exception {
        super(name, playerCap, container, spawnPosition, InstanceType.LOBBY);
    }

    @Override
    public void onJoin(Player plr) {
        if (this.isNotJoinable(plr)) {
            return;
        }
        plr.setInstance(this.getInstance(), this.getSpawn());
    }

    @Override
    public void onLeave(Player plr) {
    }

    @Override
    public void onKick(Player plr) {
    }
}
