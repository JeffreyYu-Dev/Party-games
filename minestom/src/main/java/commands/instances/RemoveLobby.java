package commands.instances;

import instances.OnlineInstancesManager;
import net.minestom.server.command.builder.Command;
import net.minestom.server.command.builder.arguments.ArgumentType;

import java.util.UUID;

public class RemoveLobby extends Command {

    public RemoveLobby() {
        super("removelobby");

        setDefaultExecutor((sender, context) -> {
            sender.sendMessage("Usage: /removelobby <instance-id>");
        });

        var instanceIdArgument = ArgumentType.String("instance-id");

        addSyntax((sender, context) -> {
            final String id = context.get(instanceIdArgument);

            var lobby = OnlineInstancesManager.removeLobby(UUID.fromString(id));
            if (lobby == null) {
                sender.sendMessage("Could not remove lobby — it may not exist or is the last one.");
                return;
            }

            sender.sendMessage("Removed lobby " + lobby.getName());

        }, instanceIdArgument);
    }
}
