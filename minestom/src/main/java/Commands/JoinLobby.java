package Commands;

import Instances.Instances;
import net.minestom.server.command.builder.Command;
import net.minestom.server.command.builder.arguments.ArgumentType;
import net.minestom.server.entity.Player;

public class JoinLobby extends Command {
    public JoinLobby() {
        super("join", "j");

        setDefaultExecutor((sender, context) -> {
            sender.sendMessage("Usage: join room");
        });

        var lobbyId = ArgumentType.String("lobby-name");


        addSyntax((sender, context) -> {
            final String id = context.get("lobby-name");
            sender.sendMessage("JOINING " + id);
            if (!(sender instanceof Player player)) return;


            Instances.getLobbyManager().getLobby(id).join(player);
        }, lobbyId);


    }
}
