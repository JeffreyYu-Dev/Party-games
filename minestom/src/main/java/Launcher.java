import commands.CommandRegistry;
import instance.InstancesManager;
import lobby.LobbyManager;
import net.minestom.server.Auth;
import net.minestom.server.MinecraftServer;
import lobby.Lobby;
import net.minestom.server.entity.GameMode;
import net.minestom.server.entity.Player;
import net.minestom.server.event.GlobalEventHandler;
import net.minestom.server.event.player.AsyncPlayerConfigurationEvent;
import net.minestom.server.instance.InstanceManager;

void main() {
    MinecraftServer server = MinecraftServer.init(new Auth.Online());

    InstanceManager instanceManager = MinecraftServer.getInstanceManager();
    InstancesManager instancesManager = new InstancesManager(new LobbyManager(instanceManager));

    instancesManager.getLobbyManager().createLobby("Lobby-1", 40);

    GlobalEventHandler globalEventHandler = MinecraftServer.getGlobalEventHandler();
    globalEventHandler.addListener(AsyncPlayerConfigurationEvent.class, event -> {
        final Player player = event.getPlayer();
        Lobby lobby = instancesManager.getLobbyManager().getLeastPopulatedLobby();
        event.setSpawningInstance(lobby.getInstance());
        player.setRespawnPoint(lobby.getSpawn());
        player.setGameMode(GameMode.CREATIVE);
    });

    CommandRegistry commandRegistry = new CommandRegistry(instancesManager);
    commandRegistry.registerAll();

    server.start("0.0.0.0", 25565);
}
