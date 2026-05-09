package DTO.maps;

import net.minestom.server.coordinate.Pos;


/**
 * DTO class for spawns
 */
public class Spawn {
    private double x;
    private double y;
    private double z;

    public Pos toPos() {
        return new Pos(this.x, this.y, this.z);
    }
}
