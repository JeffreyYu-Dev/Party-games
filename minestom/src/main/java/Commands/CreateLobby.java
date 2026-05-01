package Commands;

import net.minestom.server.command.builder.Command;
import net.minestom.server.command.builder.arguments.ArgumentType;

public class CreateLobby extends Command {
    public CreateLobby() {
        super("create", "c");

        var room = ArgumentType.String("room");


        addSyntax((sender, context) -> {
            final String roomCode = context.get("room");


            sender.sendMessage("You joined " + roomCode);
        }, room);
    }


}
