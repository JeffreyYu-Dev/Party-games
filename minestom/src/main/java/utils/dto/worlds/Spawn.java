package utils.dto.worlds;

import net.minestom.server.coordinate.Pos;

public class Spawn {
    double x;
    double y;
    double z;

    public Pos toPos() {
        return new Pos(x, y, z);
    }
}
