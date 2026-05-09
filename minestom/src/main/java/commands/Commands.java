package commands;

import commands.instances.Create;
import commands.instances.Join;
import commands.instances.ListLobbies;
import net.minestom.server.MinecraftServer;
import net.minestom.server.command.CommandManager;

public class Commands {
    public static void Register() {
        CommandManager cm = MinecraftServer.getCommandManager();

        cm.register(new Join());
        cm.register(new ListLobbies());
        cm.register(new Create());
    }
}
