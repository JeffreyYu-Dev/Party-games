import commands.Commands;
import instances.OnlineInstance;
import instances.OnlineInstancesManager;
import net.minestom.server.Auth;
import net.minestom.server.MinecraftServer;
import net.minestom.server.entity.Player;
import net.minestom.server.event.GlobalEventHandler;
import net.minestom.server.event.player.AsyncPlayerConfigurationEvent;


void main() {
    MinecraftServer minecraftServer = MinecraftServer.init(new Auth.Online());

    Commands.Register();

    OnlineInstance lobby = OnlineInstancesManager.createLobby("L1", 20, "super-flat-world");


    GlobalEventHandler globalEventHandler = MinecraftServer.getGlobalEventHandler();
    globalEventHandler.addListener(AsyncPlayerConfigurationEvent.class, event -> {
        final Player player = event.getPlayer();
        event.setSpawningInstance(lobby.getInstance());
        player.setRespawnPoint(lobby.getSpawn());
    });


    minecraftServer.start("0.0.0.0", 25565);
}
