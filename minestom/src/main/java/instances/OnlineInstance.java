package instances;

import DTO.maps.Map;
import DTO.maps.Maps;
import com.google.gson.Gson;
import net.minestom.server.MinecraftServer;
import net.minestom.server.coordinate.Pos;
import net.minestom.server.entity.Player;
import net.minestom.server.instance.InstanceContainer;
import net.minestom.server.instance.InstanceManager;

import java.io.FileReader;
import java.io.Reader;
import java.util.Objects;
import java.util.UUID;

public abstract class OnlineInstance {
    private final UUID id;
    private String name;
    private final int playerCap;
    private final InstanceContainer instance;
    private Pos spawn;


    public OnlineInstance(String name, int playerCap) {
        this.id = UUID.randomUUID();
        this.name = name;
        this.playerCap = playerCap;

        InstanceManager manager = MinecraftServer.getInstanceManager();
        this.instance = manager.createInstanceContainer();
    }

    public void setMap(String mapName) throws NullPointerException {
        Maps maps = parseMaps();
        Map map = maps.getMap(mapName);

        if (map == null) {
            throw new NullPointerException("Map doesn't exist");
        }

        this.spawn = map.getDefaultSpawn().toPos();
        this.instance.setChunkLoader(map.getMap());

    }

    private Maps parseMaps() {
        try (Reader reader = new FileReader(Objects.requireNonNull(getClass().getResource("/maps/details.json")).getPath())) {
            Gson gson = new Gson();
            return gson.fromJson(reader, Maps.class);

        } catch (Exception e) {
            throw new RuntimeException("failed to find details json file");
        }
    }

    public String getName() {
        return this.name;
    }

    public UUID getId() {
        return this.id;
    }

    public Pos getSpawn() {
        return this.spawn;
    }

    public InstanceContainer getInstance() {
        return this.instance;
    }

    public int getPlayerCount() {
        return this.instance.getPlayers().size();
    }

    public int getPlayerCap() {
        return this.playerCap;
    }

    public void join(Player plr) {
        if (plr.getInstance() == this.instance) return;

        plr.setInstance(this.instance, this.spawn);
    }

    public void setName(String name) {
        this.name = name;
    }
}
