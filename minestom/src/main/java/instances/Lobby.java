package instances;

import com.google.gson.Gson;
import net.minestom.server.entity.Player;
import net.minestom.server.event.instance.RemoveEntityFromInstanceEvent;
import net.minestom.server.event.player.PlayerDisconnectEvent;
import net.minestom.server.event.player.PlayerSpawnEvent;
import services.AppContext;

import java.util.Map;

public class Lobby extends OnlineInstance {
    private static final Gson GSON = new Gson();
    private static final String EVENTS_CHANNEL = "mc:lobby:events";

    public Lobby(String name, int playerCap) {
        super(name, playerCap);
    }

    @Override
    protected void registerEvents() {
        getEventNode().addListener(PlayerSpawnEvent.class, e -> {
            String payload = GSON.toJson(Map.of(
                    "type", "playerJoined",
                    "lobbyId", getId().toString(),
                    "playerId", e.getPlayer().getUuid().toString(),
                    "username", e.getPlayer().getUsername()
            ));
            AppContext.redis().publish(EVENTS_CHANNEL, payload);
        });

        getEventNode().addListener(PlayerDisconnectEvent.class, e -> {
            String payload = GSON.toJson(Map.of(
                    "type", "playerLeft",
                    "lobbyId", getId().toString(),
                    "playerId", e.getPlayer().getUuid().toString(),
                    "username", e.getPlayer().getUsername()
            ));

            AppContext.redis().publish(EVENTS_CHANNEL, payload);
        });
    }
}
