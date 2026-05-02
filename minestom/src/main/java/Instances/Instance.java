package Instances;

import net.minestom.server.coordinate.Pos;
import net.minestom.server.entity.Player;
import net.minestom.server.instance.InstanceContainer;

import java.util.UUID;

public abstract class Instance {
    private final UUID instanceId;
    private final String name;
    private final int playerCap;
    private final InstanceContainer world;
    private final InstanceType type;
    private final Pos spawnPosition;

    public Instance(String name, int playerCap, InstanceContainer world, Pos spawnPosition, InstanceType type) throws Exception {
        if (playerCap <= 0) {
            throw new Exception("Player cap must be greater than 0");
        }

        this.instanceId = UUID.randomUUID();
        this.name = name;
        this.playerCap = playerCap;
        this.world = world;
        this.type = type;
        this.spawnPosition = spawnPosition;
    }

    public void join(Player plr) {
        if (this.world.getPlayers().size() > this.playerCap) {
            plr.sendMessage("Instance is full!");
            return;
        }


        if (plr.getInstance() == this.world) {
            plr.sendMessage("You're already in this instance");
            return;
        }

        plr.setInstance(this.world, spawnPosition);
    }


    public InstanceContainer getInstance() {
        return this.world;
    }

    public int getPlayerCap() {
        return this.playerCap;
    }

    public int getNumberOfPlayers() {
        return this.world.getPlayers().size();
    }


}
