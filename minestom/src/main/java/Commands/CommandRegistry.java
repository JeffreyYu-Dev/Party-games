package commands;

import instance.InstancesManager;
import net.minestom.server.MinecraftServer;
import net.minestom.server.command.CommandManager;

public class CommandRegistry {
    private final InstancesManager instancesManager;

    public CommandRegistry(InstancesManager instancesManager) {
        this.instancesManager = instancesManager;
    }

    public void registerAll() {
        CommandManager cm = MinecraftServer.getCommandManager();
        cm.register(new JoinLobby(instancesManager));
        cm.register(new CreateLobby(instancesManager));
        cm.register(new ListLobbies(instancesManager));
    }
}
