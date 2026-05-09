package commands.instances;

import instances.Lobby;
import instances.OnlineInstance;
import instances.OnlineInstancesManager;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.event.ClickEvent;
import net.kyori.adventure.text.format.NamedTextColor;
import net.minestom.server.command.builder.Command;

import java.util.List;

public class ListLobbies extends Command {
    public ListLobbies() {
        super("list", "l");

        setDefaultExecutor((sender, context) -> {
            List<Lobby> lobbies = OnlineInstancesManager.getLobbies();

            sender.sendMessage("Available lobbies:");
            
            lobbies.forEach(lobby -> {
                sender.sendMessage(Component.text("   " + lobby.getName() + " (").append(Component.text(lobby.getId().toString()).color(NamedTextColor.YELLOW).clickEvent(ClickEvent.copyToClipboard(lobby.getId().toString()))).append(Component.text("): " + lobby.getPlayerCount() + "/" + lobby.getPlayerCap())));
            });
        });
    }
}