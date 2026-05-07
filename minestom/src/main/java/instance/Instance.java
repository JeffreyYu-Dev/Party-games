package instance;

import net.minestom.server.coordinate.Pos;
import net.minestom.server.entity.Player;
import net.minestom.server.instance.InstanceContainer;

import java.util.Set;
import java.util.UUID;

public abstract class Instance {
    private final UUID id;
    private final String name;
    private final int playerCap;
    private final InstanceContainer world;
    private final InstanceType type;
    private final Pos spawn;

    public Instance(String name, int playerCap, InstanceContainer world, Pos spawnPosition, InstanceType type) throws Exception {
        if (playerCap <= 0) {
            throw new Exception("Player cap must be greater than 0");
        }
        this.id = UUID.randomUUID();
        this.name = name;
        this.playerCap = playerCap;
        this.world = world;
        this.type = type;
        this.spawn = spawnPosition;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public boolean isInstanceFull() {
        return world.getPlayers().size() >= playerCap;
    }

    public boolean isPlayerInInstance(Player plr) {
        return plr.getInstance() == world;
    }

    public boolean isNotJoinable(Player plr) {
        return isInstanceFull() || isPlayerInInstance(plr);
    }

    public abstract void onJoin(Player plr);

    public abstract void onLeave(Player plr);

    public abstract void onKick(Player plr);

    public Pos getSpawn() {
        return spawn;
    }

    public InstanceContainer getInstance() {
        return world;
    }

    public int getPlayerCap() {
        return playerCap;
    }

    public int getNumberOfPlayers() {
        return world.getPlayers().size();
    }

    public Set<Player> getPlayers() {
        return world.getPlayers();
    }
}
