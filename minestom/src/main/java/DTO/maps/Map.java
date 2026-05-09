package DTO.maps;


import net.minestom.server.instance.anvil.AnvilLoader;

import java.util.List;
import java.util.Objects;

/**
 * DTO class for maps
 */
public class Map {
    private String name;
    private SpawnObject spawn;
    private String folder;

    public String getName() {
        return this.name;
    }

    public AnvilLoader getMap() throws NullPointerException {
        return new AnvilLoader(Objects.requireNonNull(getClass().getResource("/maps" + this.folder)).getPath());
    }

    public Spawn getDefaultSpawn() {
        return this.spawn.getDefaultLocation();
    }

    public List<Spawn> getOtherLocations() {
        return this.spawn.getOtherLocations();
    }
}
