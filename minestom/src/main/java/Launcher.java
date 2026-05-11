import commands.Commands;
import instances.OnlineInstance;
import instances.OnlineInstancesManager;
import net.minestom.server.Auth;
import net.minestom.server.MinecraftServer;
import net.minestom.server.entity.Player;
import net.minestom.server.event.GlobalEventHandler;
import net.minestom.server.event.player.AsyncPlayerConfigurationEvent;
import services.HttpServer;


void main() {
    MinecraftServer minecraftServer = MinecraftServer.init(new Auth.Online());

    new HttpServer(8080);

    Commands.Register();

    OnlineInstance lobby = OnlineInstancesManager.createLobby("L1", Integer.MAX_VALUE, "super-flat-world");


    GlobalEventHandler globalEventHandler = MinecraftServer.getGlobalEventHandler();
    globalEventHandler.addListener(AsyncPlayerConfigurationEvent.class, event -> {
        final Player player = event.getPlayer();
        event.setSpawningInstance(lobby.getInstance());
        player.setRespawnPoint(lobby.getSpawn());
    });

    minecraftServer.start("0.0.0.0", 25565);
}
