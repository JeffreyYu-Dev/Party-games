package Instances.Rooms;

import java.util.UUID;

public class RoomCode {
    private final String code;


    //    TODO: in the future add validation because someone could mess up the system?
    public RoomCode(String code) {
        this.code = code;
    }

    public String getRoomCode() {
        return this.code;
    }
}
