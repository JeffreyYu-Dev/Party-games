package commands;

import instance.InstancesManager;
import net.minestom.server.command.builder.Command;
import net.minestom.server.command.builder.arguments.ArgumentType;

public class CreateLobby extends Command {

    public CreateLobby(InstancesManager instancesManager) {
        super("create", "c");
        var lobbyName = ArgumentType.String("name");
        var lobbySize = ArgumentType.Integer("size");

        addSyntax((sender, context) -> {
            final String name = context.get("name");
            final int size = context.get("size");
            instancesManager.getLobbyManager().createLobby(name, size);
            sender.sendMessage("Created lobby: " + name);
        }, lobbyName, lobbySize);
    }
}
