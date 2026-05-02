package Commands;

import Instances.Instances;
import net.minestom.server.command.builder.Command;
import net.minestom.server.command.builder.arguments.ArgumentType;
import net.minestom.server.coordinate.Pos;

public class CreateLobby extends Command {
    public CreateLobby() {
        super("create", "c");

        var lobbyName = ArgumentType.String("name");
        var lobbyPosition = ArgumentType.RelativeVec3("spawn-position");
        var lobbySize = ArgumentType.Integer("size");

        addSyntax((sender, context) -> {
            final String name = context.get("name");
//            final Pos position = context.get("spawn-position");
            final int size = context.get("size");


            Instances.getLobbyManager().createLobby(name, new Pos(0, 42, 0), size);

            sender.sendMessage("created " + name);
        }, lobbyName, lobbySize);
    }


}
