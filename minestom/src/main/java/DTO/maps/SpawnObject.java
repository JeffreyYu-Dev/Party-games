package DTO.maps;

import java.util.List;

/**
 * DTO class for spawn object
 */
public class SpawnObject {
    private Spawn defaultLocation;
    private List<Spawn> otherLocations;

    public Spawn getDefaultLocation() {
        return this.defaultLocation;
    }

    public List<Spawn> getOtherLocations() {
        return this.otherLocations;
    }
}
