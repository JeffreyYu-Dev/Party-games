package commands.instances;

import instances.OnlineInstancesManager;
import net.minestom.server.command.builder.Command;
import net.minestom.server.command.builder.arguments.ArgumentType;

public class Create extends Command {

    public Create() {
        super("create", "c");

        setDefaultExecutor((sender, context) -> {
            sender.sendMessage("Usage: /create <name> <player cap> <map>");
        });


        var nameArgument = ArgumentType.String("name");
        var playerCapArgument = ArgumentType.Integer("player-cap");
        var mapArgument = ArgumentType.String("map");


        addSyntax((sender, context) -> {
            final String name = context.get(nameArgument);
            final int playerCap = context.get(playerCapArgument);
            final String map = context.get(mapArgument);


            OnlineInstancesManager.createLobby(name, playerCap, map);

        }, nameArgument, playerCapArgument, mapArgument);

    }
}
