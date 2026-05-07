package utils.dto.worlds;

import instance.InstanceType;

import java.util.List;

public class WorldCategory {
    InstanceType type;
    List<WorldMap> maps;

    public InstanceType getType() {
        return type;
    }

    public List<WorldMap> getMaps() {
        return maps;
    }
}
