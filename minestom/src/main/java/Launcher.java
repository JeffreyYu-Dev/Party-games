import commands.Commands;
import instances.OnlineInstance;
import instances.OnlineInstancesManager;
import net.minestom.server.Auth;
import net.minestom.server.MinecraftServer;
import net.minestom.server.entity.Player;
import net.minestom.server.event.GlobalEventHandler;
import net.minestom.server.event.player.AsyncPlayerConfigurationEvent;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import services.AppContext;
import services.BackendClient;
import services.HttpServer;
import services.Redis;
import java.util.UUID;


void main() {
    MinecraftServer minecraftServer = MinecraftServer.init(new Auth.Online());

    String redisUrl = System.getenv("REDIS_URL");
    String backendUrl = System.getenv("BACKEND_URL");
    String internalSecret = System.getenv("INTERNAL_SECRET");

    AppContext.init(
            new Redis(redisUrl),
            new BackendClient(backendUrl, internalSecret)
    );

    new HttpServer(8080);

    Commands.Register();

    OnlineInstance lobby = OnlineInstancesManager.createLobby("L1", Integer.MAX_VALUE, "super-flat-world");

    GlobalEventHandler globalEventHandler = MinecraftServer.getGlobalEventHandler();
    globalEventHandler.addListener(AsyncPlayerConfigurationEvent.class, event -> {
        final Player player = event.getPlayer();
        event.setSpawningInstance(lobby.getInstance());
        player.setRespawnPoint(lobby.getSpawn());

        Thread.ofVirtual().start(() -> {
            try {
                AppContext.backend().upsertAccount(player.getUuid(), player.getUsername());
            } catch (Exception e) {
                // non-fatal — player can still play, friend features just won't work
            }
        });
    });

    Gson gson = new Gson();
    AppContext.redis().subscribe("mc:friend:request", (channel, message) -> {
        JsonObject payload = gson.fromJson(message, JsonObject.class);
        UUID receiverId = UUID.fromString(payload.get("receiverId").getAsString());
        String requesterName = payload.get("requesterName").getAsString();

        MinecraftServer.getConnectionManager().getOnlinePlayers().stream()
                .filter(p -> p.getUuid().equals(receiverId))
                .findFirst()
                .ifPresent(p -> p.sendMessage(
                    net.kyori.adventure.text.Component.text(
                        requesterName + " sent you a friend request! Type /friend accept " + requesterName + " to accept."
                    )
                ));
    });

    minecraftServer.start("0.0.0.0", 25565);
}
