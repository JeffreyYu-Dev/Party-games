package Commands;

import Instances.Lobby.LobbyManager;
import net.minestom.server.MinecraftServer;
import net.minestom.server.command.CommandManager;

public class CommandRegistry {
    public void registerAll() {
        CommandManager cm = MinecraftServer.getCommandManager();
        cm.register(new JoinLobby());
        cm.register(new CreateLobby());

    }


}
