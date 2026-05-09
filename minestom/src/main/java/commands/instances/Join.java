package commands.instances;

import instances.Lobby;
import instances.OnlineInstancesManager;
import net.minestom.server.command.builder.Command;
import net.minestom.server.command.builder.arguments.ArgumentType;
import net.minestom.server.entity.Player;

import java.util.UUID;

public class Join extends Command {

    public Join() {
        super("join", "j");

        var instanceIdArgument = ArgumentType.String("instance-id");

        addSyntax((sender, context) -> {
            final String id = context.get(instanceIdArgument);

            Lobby lobby = OnlineInstancesManager.getLobby(UUID.fromString(id));


            if (sender instanceof Player player) {
                lobby.join(player);
            }

        }, instanceIdArgument);

    }
}
