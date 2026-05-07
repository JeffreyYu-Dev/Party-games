package party;

import instance.Instance;
import instance.InstanceType;
import net.minestom.server.coordinate.Pos;
import net.minestom.server.entity.Player;
import net.minestom.server.instance.InstanceContainer;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

public class Party extends Instance {
    private Player host;
    private final String code;
    private final Map<UUID, Long> playerJoinTimes = new HashMap<>();

    public Party(String name, int playerCap, Pos spawnPosition, InstanceContainer world) throws Exception {
        super(name, playerCap, world, spawnPosition, InstanceType.PARTY);
        this.code = generateRoomCode();
    }

    public void setHost(Player host) {
        this.host = host;
    }

    public String getCode() {
        return code;
    }

    @Override
    public void onJoin(Player plr) {
        if (this.isNotJoinable(plr)) {
            return;
        }
        plr.setInstance(this.getInstance(), this.getSpawn());
        this.playerJoinTimes.put(plr.getUuid(), System.currentTimeMillis());
    }

    @Override
    public void onLeave(Player plr) {
        this.playerJoinTimes.remove(plr.getUuid());

        if (plr.equals(this.host)) {
            getLongestPlayer().ifPresent(this::setHost);
        }
    }

    @Override
    public void onKick(Player plr) {
    }

    private Optional<Player> getLongestPlayer() {
        return playerJoinTimes.entrySet().stream()
                .min(Map.Entry.comparingByValue())
                .flatMap(entry -> this.getPlayers().stream()
                        .filter(p -> p.getUuid().equals(entry.getKey()))
                        .findFirst());
    }

    private String generateRoomCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        StringBuilder sb = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < 6; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
