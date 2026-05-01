package Instances.Rooms;

import net.minestom.server.entity.Player;

import java.util.ArrayList;
import java.util.List;

import java.util.UUID;

public class Room {
    private final UUID id;
    private final String code;
    private Player host;
    private RoomStatus status = RoomStatus.PRIVATE;

    // TODO: track which minigame and probably stats?

    /**
     *
     * @param code
     * @param roomId
     */
    public Room(UUID roomId, RoomCode code, Player host) {
        this.code = code.getRoomCode();
        this.id = roomId;
        this.host = host;

//        TODO: move the host into the lobby cuz they created they
    }

    /**
     *
     * @param player
     */
    public void join(Player player) {
//        TODO: try to move the player into the server
    }

    /**
     *
     * @param player
     */
    public void leave(Player player) {
//        TODO: if the host leaves ensure new host(EDGE CASE)

//        TODO: remove player from the server

    }

    /**
     *
     * @param player
     */
    public void kick(Player player) {
        //        remove from server and player list


    }

    //    TODO:
    private boolean validPlayerList() {


        return true;
    }

    ;

    //    TODO:
    private void purgeInvalidPlayers() {

    }

    public void openRoom() {
        this.status = RoomStatus.PUBLIC;
    }

    public void closeRoom() {
        this.status = RoomStatus.PRIVATE;
    }

    /**
     *
     * @return RoomStatus
     */
    public RoomStatus getRoomStatus() {
        return this.status;
    }

    /**
     *
     * @param newHost
     */
    public void makeHost(Player newHost) {
        this.host = newHost;
    }

    private void movePlayerToRoom(Player player) {
//        TODO: move player into lobby
    }

}
