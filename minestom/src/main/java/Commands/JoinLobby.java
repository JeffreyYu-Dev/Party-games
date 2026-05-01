package Commands;

import Instances.Instances;
import Instances.Lobby.LobbyManager;
import net.minestom.server.command.builder.Command;
import net.minestom.server.command.builder.arguments.ArgumentType;
import net.minestom.server.entity.Player;

public class JoinLobby extends Command {
    public JoinLobby() {
        super("join", "j");

        setDefaultExecutor((sender, context) -> {
            sender.sendMessage("Usage: join room");
        });

        var lobbyId = ArgumentType.String("lobby-id");


        addSyntax((sender, context) -> {
            final String id = context.get("lobby-id");
            sender.sendMessage("JOINING " + id);
            if (!(sender instanceof Player player)) return;


            Instances.getLobbyManager().joinLobby(player, id);
        }, lobbyId);


    }
}
