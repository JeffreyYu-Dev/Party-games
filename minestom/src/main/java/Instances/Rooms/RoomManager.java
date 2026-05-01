package Instances.Rooms;

import net.minestom.server.entity.Player;
import net.minestom.server.instance.InstanceManager;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class RoomManager {
    //    this will hold all available rooms
    private final InstanceManager instanceManager;

    // TODO: use redis for scalability?
    private final List<Room> rooms = new ArrayList<Room>();

    public RoomManager(InstanceManager manager) {
        this.instanceManager = manager;
    }


    public void createRoom(String code, Player player) {

        // TODO: GENERATE RANDOM ID
        Room newRoom = new Room(UUID.randomUUID(), new RoomCode(code), player);
        this.rooms.add(newRoom);

        // TODO: we need to move the player that created it into the room


    }
}
