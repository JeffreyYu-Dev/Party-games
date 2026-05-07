package manager;

import com.google.gson.Gson;
import com.google.gson.stream.JsonReader;
import instance.Instance;
import instance.InstanceType;
import net.minestom.server.instance.InstanceManager;
import net.minestom.server.instance.anvil.AnvilLoader;
import utils.dto.worlds.WorldCategory;
import utils.dto.worlds.WorldMap;
import utils.dto.worlds.WorldMapContents;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public abstract class Manager<T extends Instance> {
    private final InstanceManager instanceManager;
    private final Map<UUID, T> instances = new HashMap<>();

    public Manager(InstanceManager instanceManager) {
        this.instanceManager = instanceManager;
    }

    protected InstanceManager getInstanceManager() {
        return instanceManager;
    }

    protected void register(T instance) {
        instances.put(instance.getId(), instance);
    }

    public Map<UUID, T> getAll() {
        return instances;
    }

    public T getById(UUID id) {
        return instances.get(id);
    }

    protected WorldMap getWorldMap(String mapName, InstanceType type) {
        try {
            InputStream stream = getClass().getClassLoader().getResourceAsStream("worlds/worlds.json");
            if (stream == null) throw new Exception("worlds/worlds.json not found in resources");

            Gson gson = new Gson();
            WorldMapContents contents = gson.fromJson(new JsonReader(new InputStreamReader(stream)), WorldMapContents.class);

            WorldCategory category = switch (type) {
                case LOBBY -> contents.getLobby();
                case PARTY -> contents.getParty();
                default -> null;
            };

            if (category == null) return null;

            return category.getMaps().stream()
                    .filter(m -> m.getName().equals(mapName))
                    .findFirst()
                    .orElse(null);
        } catch (Exception e) {
            System.err.println("Could not load map '" + mapName + "': " + e.getMessage());
            return null;
        }
    }

    protected AnvilLoader loadMap(String mapName, InstanceType type) {
        WorldMap worldMap = getWorldMap(mapName, type);
        return worldMap != null ? new AnvilLoader("resources/worlds/lobby") : null;
    }
}
