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
import net.minestom.server.instance.InstanceManager;


void main() {
    MinecraftServer server = MinecraftServer.init(new Auth.Online());


    // Create the instance
    InstanceManager instanceManager = MinecraftServer.getInstanceManager();


    Instances.init(new LobbyManager(instanceManager), new RoomManager(instanceManager));


//    when the server starts there needs to be a first lobby
    Instances.getLobbyManager().createLobby("Lobby-1", new Pos(0, 42, 0), 40);


    GlobalEventHandler globalEventHandler = MinecraftServer.getGlobalEventHandler();
    globalEventHandler.addListener(AsyncPlayerConfigurationEvent.class, event -> {
        final Player player = event.getPlayer();
//        TODO: FIX THIS we're not using the join method we made in the lobby manager
//        this event always needs event.setSpawningInstance() but it conflicts with player.setInstance() in the lobby join method

        event.setSpawningInstance(Instances.getLobbyManager().getLeastPopulatedLobby().getInstance());
        player.setRespawnPoint(new Pos(0, 42, 0));


        player.setGameMode(GameMode.CREATIVE);
    });


    //    register all commands
    CommandRegistry cm = new CommandRegistry();
    cm.registerAll();


    server.start("0.0.0.0", 25565);
}