package commands;

import instance.InstancesManager;
import lobby.Lobby;
import net.minestom.server.command.builder.Command;
import net.minestom.server.command.builder.arguments.ArgumentType;
import net.minestom.server.entity.Player;

public class JoinLobby extends Command {

    public JoinLobby(InstancesManager instancesManager) {
        super("join", "j");
        setDefaultExecutor((sender, context) -> sender.sendMessage("Usage: /join <lobby-name>"));

        var lobbyName = ArgumentType.String("lobby-name");

        addSyntax((sender, context) -> {
            if (!(sender instanceof Player player)) return;

            final String name = context.get("lobby-name");
            Lobby lobby = instancesManager.getLobbyManager().getLobby(name);

            if (lobby == null) {
                sender.sendMessage("Lobby not found: " + name);
                return;
            }

            lobby.onJoin(player);
        }, lobbyName);
    }
}
