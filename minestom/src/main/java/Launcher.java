import Commands.CommandRegistry;
import Instances.Instances;
import Instances.Lobby.LobbyManager;
import Instances.Rooms.RoomManager;
import net.minestom.server.Auth;
import net.minestom.server.MinecraftServer;
import net.minestom.server.coordinate.Pos;
import net.minestom.server.entity.GameMode;
import net.minestom.server.entity.Player;
import net.minestom.server.event.GlobalEventHandler;
import net.minestom.server.event.player.AsyncPlayerConfigurationEvent;
import net.minestom.server.event.player.PlayerSpawnEvent;
import net.minestom.server.instance.InstanceManager;
import net.minestom.server.network.packet.server.play.PlayerInfoRemovePacket;


void main() {
    MinecraftServer server = MinecraftServer.init(new Auth.Online());


    // Create the instance
    InstanceManager instanceManager = MinecraftServer.getInstanceManager();


    Instances.init(new LobbyManager(instanceManager), new RoomManager(instanceManager));


//    when the server starts there needs to be a first lobby
    Instances.getLobbyManager().createLobby("Lobby-1");


    GlobalEventHandler globalEventHandler = MinecraftServer.getGlobalEventHandler();
    globalEventHandler.addListener(AsyncPlayerConfigurationEvent.class, event -> {
        final Player player = event.getPlayer();
        event.setSpawningInstance(Instances.getLobbyManager().getFirstLobby());
        player.setRespawnPoint(new Pos(0, 42, 0));
        player.setGameMode(GameMode.CREATIVE);
    });

    globalEventHandler.addListener(PlayerSpawnEvent.class, event -> {
        Player joined = event.getPlayer();

        MinecraftServer.getConnectionManager().getOnlinePlayers()
                .forEach(other -> {
                    if (other.equals(joined)) return;

                    if (!other.getInstance().equals(joined.getInstance())) {
                        // Remove other from joined's tab list
                        joined.sendPacket(new PlayerInfoRemovePacket(other.getUuid()));
                        // Remove joined from other's tab list
                        other.sendPacket(new PlayerInfoRemovePacket(joined.getUuid()));
                    }
                });
    });

    //    register all commands
    CommandRegistry cm = new CommandRegistry();
    cm.registerAll();


    server.start("0.0.0.0", 25565);
}