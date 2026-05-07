package commands;

import instance.InstancesManager;
import lobby.Lobby;
import net.minestom.server.command.builder.Command;

import java.util.Collection;

public class ListLobbies extends Command {

    public ListLobbies(InstancesManager instancesManager) {
        super("lobbies");

        setDefaultExecutor((sender, context) -> {
            Collection<Lobby> lobbies = instancesManager.getLobbyManager().getAll().values();

            if (lobbies.isEmpty()) {
                sender.sendMessage("No lobbies available.");
                return;
            }

            StringBuilder sb = new StringBuilder("Lobbies (" + lobbies.size() + "):\n");
            for (Lobby lobby : lobbies) {
                sb.append("  ").append(lobby.getName())
                  .append(" — ").append(lobby.getNumberOfPlayers())
                  .append("/").append(lobby.getPlayerCap())
                  .append("\n");
            }

            sender.sendMessage(sb.toString().stripTrailing());
        });
    }
}
