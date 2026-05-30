package commands.instances;

import net.minestom.server.command.builder.Command;
import net.minestom.server.command.builder.arguments.ArgumentType;
import net.minestom.server.entity.Player;
import net.kyori.adventure.text.Component;
import services.AppContext;
import services.BackendClient;

import java.util.List;
import java.util.UUID;

public class Friend extends Command {

    public Friend() {
        super("friend", "f");

        var listAction = ArgumentType.Literal("list");
        addSyntax((sender, context) -> {
            if (!(sender instanceof Player player)) return;
            Thread.ofVirtual().start(() -> {
                try {
                    List<BackendClient.Friend> friends = AppContext.backend().getFriends(player.getUuid());
                    if (friends.isEmpty()) {
                        player.sendMessage(Component.text("You have no friends yet."));
                        return;
                    }
                    player.sendMessage(Component.text("--- Friends (" + friends.size() + ") ---"));
                    for (var friend : friends) {
                        player.sendMessage(Component.text("  " + friend.username()));
                    }
                } catch (Exception e) {
                    player.sendMessage(Component.text("Failed to fetch friends list."));
                }
            });
        }, listAction);

        var subcommand = ArgumentType.Word("action").from("add", "accept", "decline", "remove", "block", "unblock");
        var usernameArg = ArgumentType.String("username");

        addSyntax((sender, context) -> {
            if (!(sender instanceof Player player)) return;

            String action = context.get(subcommand);
            String targetUsername = context.get(usernameArg);

            if (player.getUsername().equalsIgnoreCase(targetUsername)) {
                player.sendMessage(Component.text("You cannot do that to yourself."));
                return;
            }

            Thread.ofVirtual().start(() -> {
                try {
                    AppContext.backend().upsertAccount(player.getUuid(), player.getUsername());

                    UUID targetId = AppContext.backend().resolveUsername(targetUsername);
                    if (targetId == null) {
                        player.sendMessage(Component.text("Player '" + targetUsername + "' not found."));
                        return;
                    }

                    switch (action) {
                        case "add" -> {
                            AppContext.backend().sendFriendRequest(player.getUuid(), targetId);
                            player.sendMessage(Component.text("Friend request sent to " + targetUsername + "."));
                        }
                        case "accept" -> {
                            AppContext.backend().acceptFriendRequest(targetId, player.getUuid());
                            player.sendMessage(Component.text("You are now friends with " + targetUsername + "."));
                        }
                        case "decline" -> {
                            AppContext.backend().declineFriendRequest(targetId, player.getUuid());
                            player.sendMessage(Component.text("Declined friend request from " + targetUsername + "."));
                        }
                        case "remove" -> {
                            AppContext.backend().removeFriend(player.getUuid(), targetId);
                            player.sendMessage(Component.text("Removed " + targetUsername + " from your friends."));
                        }
                        case "block" -> {
                            AppContext.backend().blockUser(player.getUuid(), targetId);
                            player.sendMessage(Component.text("Blocked " + targetUsername + "."));
                        }
                        case "unblock" -> {
                            AppContext.backend().unblockUser(player.getUuid(), targetId);
                            player.sendMessage(Component.text("Unblocked " + targetUsername + "."));
                        }
                    }
                } catch (Exception e) {
                    player.sendMessage(Component.text("Something went wrong. Please try again."));
                }
            });
        }, subcommand, usernameArg);
    }
}
