package services;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import instances.Lobby;
import instances.OnlineInstancesManager;
import io.javalin.Javalin;
import io.javalin.json.JavalinGson;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import DTO.maps.Maps;
import net.kyori.adventure.text.Component;
import net.minestom.server.entity.Player;

public class HttpServer {

    public HttpServer(int port) {
        Gson gson = new GsonBuilder().serializeNulls().create();

        Javalin app = Javalin.create(config -> {
            config.jsonMapper(new JavalinGson(gson, true));

//            TODO: add a route to get what maps are available

            config.routes.get("/maps", ctx -> {
//                Maps maps =
            });

            config.routes.get("/lobby/list", ctx -> {
                List<Lobby> lobbies = OnlineInstancesManager.getLobbies();
                List<Map<String, Object>> result = lobbies.stream().map(lobby -> Map.<String, Object>of(
                        "id", lobby.getId().toString(),
                        "name", lobby.getName(),
                        "playerCap", lobby.getPlayerCap(),
                        "players", lobby.getPlayers().stream().map(p -> Map.of(
                            "id", p.getUuid().toString(),
                            "username", p.getUsername()
                        )).toArray(),
                        "map", lobby.getMap(),
                        "startedAt", lobby.getUptimeStart()
                )).toList();

                ctx.json(result);
            });

            config.routes.get("/lobby/{id}", ctx -> {
                UUID id;
                try {
                    id = UUID.fromString(ctx.pathParam("id"));
                } catch (IllegalArgumentException e) {
                    ctx.status(400).json(Map.of("error", "invalid UUID"));
                    return;
                }
                Lobby lobby = OnlineInstancesManager.getLobby(id);

                ctx.json(Map.of(
                        "id", lobby.getId().toString(),
                        "name", lobby.getName(),
                        "playerCap", lobby.getPlayerCap(),
                        "players", lobby.getPlayers().stream().map(p -> Map.of(
                            "id", p.getUuid().toString(),
                            "username", p.getUsername()
                        )).toArray(),
                        "map", lobby.getMap(),
                        "startedAt", lobby.getUptimeStart()
                ));
            });

            config.routes.post("/lobby", ctx -> {
                record CreateLobbyRequest(String name, String map, int playerCap) {
                }

                CreateLobbyRequest body = ctx.bodyAsClass(CreateLobbyRequest.class);
                if (body.name() == null || body.map() == null) {
                    ctx.status(400).json(Map.of("error", "name and map are required"));
                    return;
                }

                Lobby lobby = (Lobby) OnlineInstancesManager.createLobby(body.name(), body.playerCap(), body.map());

                AppContext.redis().publish("mc:lobby:created", gson.toJson(Map.of(
                    "type", "created",
                    "lobbyId", lobby.getId().toString(),
                    "name", lobby.getName(),
                    "playerCap", lobby.getPlayerCap(),
                    "map", lobby.getMap() != null ? lobby.getMap() : ""
                )));

                ctx.status(201).json(Map.of(
                        "id", lobby.getId().toString(),
                        "name", lobby.getName(),
                        "playerCap", lobby.getPlayerCap()
                ));
            });

            config.routes.delete("/lobby/{id}", ctx -> {
                UUID id;
                try {
                    id = UUID.fromString(ctx.pathParam("id"));
                } catch (IllegalArgumentException e) {
                    ctx.status(400).json(Map.of("error", "invalid UUID"));
                    return;
                }

                Lobby lobby = OnlineInstancesManager.removeLobby(id);
                if (lobby == null) {
                    ctx.status(404).json(Map.of("error", "lobby not found or is the last remaining lobby"));
                    return;
                }

                AppContext.redis().publish("mc:lobby:events", gson.toJson(Map.of(
                    "type", "deleted",
                    "lobbyId", lobby.getId().toString()
                )));

                ctx.json(Map.of("removed", lobby.getId().toString(), "name", lobby.getName()));
            });


            config.routes.post("/lobby/{id}/kick", ctx -> {
                record KickRequest(String playerId) {}
                UUID id;
                try {
                    id = UUID.fromString(ctx.pathParam("id"));
                } catch (IllegalArgumentException e) {
                    ctx.status(400).json(Map.of("error", "invalid UUID"));
                    return;
                }

                Lobby lobby = OnlineInstancesManager.getLobby(id);
                if (lobby == null) {
                    ctx.status(404).json(Map.of("error", "lobby not found"));
                    return;
                }

                KickRequest body = ctx.bodyAsClass(KickRequest.class);
                UUID playerId;
                try {
                    playerId = UUID.fromString(body.playerId());
                } catch (IllegalArgumentException e) {
                    ctx.status(400).json(Map.of("error", "invalid player UUID"));
                    return;
                }

                Player player = lobby.getPlayers().stream()
                    .filter(p -> p.getUuid().equals(playerId))
                    .findFirst()
                    .orElse(null);

                if (player == null) {
                    ctx.status(404).json(Map.of("error", "player not found in lobby"));
                    return;
                }

                player.kick(Component.text("You have been kicked by an admin."));
                ctx.json(Map.of("kicked", body.playerId()));
            });

            config.routes.post("/lobby/{id}/move", ctx -> {
                record MoveRequest(String playerId, String targetLobbyId) {}
                UUID id;
                try {
                    id = UUID.fromString(ctx.pathParam("id"));
                } catch (IllegalArgumentException e) {
                    ctx.status(400).json(Map.of("error", "invalid UUID"));
                    return;
                }

                Lobby lobby = OnlineInstancesManager.getLobby(id);
                if (lobby == null) {
                    ctx.status(404).json(Map.of("error", "source lobby not found"));
                    return;
                }

                MoveRequest body = ctx.bodyAsClass(MoveRequest.class);
                UUID playerId;
                UUID targetId;
                try {
                    playerId = UUID.fromString(body.playerId());
                    targetId = UUID.fromString(body.targetLobbyId());
                } catch (IllegalArgumentException e) {
                    ctx.status(400).json(Map.of("error", "invalid UUID"));
                    return;
                }

                Player player = lobby.getPlayers().stream()
                    .filter(p -> p.getUuid().equals(playerId))
                    .findFirst()
                    .orElse(null);

                if (player == null) {
                    ctx.status(404).json(Map.of("error", "player not found in lobby"));
                    return;
                }

                Lobby targetLobby = OnlineInstancesManager.getLobby(targetId);
                if (targetLobby == null) {
                    ctx.status(404).json(Map.of("error", "target lobby not found"));
                    return;
                }

                targetLobby.join(player);
                ctx.json(Map.of("moved", body.playerId(), "to", body.targetLobbyId()));
            });

            config.routes.patch("/lobby/{id}", ctx -> {
                record EditLobbyRequest(String name) {
                }
                UUID id;

                try {
                    id = UUID.fromString(ctx.pathParam("id"));
                } catch (IllegalArgumentException e) {
                    ctx.status(400).json(Map.of("error", "invalid UUID"));
                    return;
                }

                EditLobbyRequest body = ctx.bodyAsClass(EditLobbyRequest.class);
                if (body.name() == null) {
                    ctx.status(400).json(Map.of("error", "name is required"));
                    return;
                }

                Lobby lobby = OnlineInstancesManager.getLobby(id);
                lobby.setName(body.name());

                AppContext.redis().publish("mc:lobby:events", gson.toJson(Map.of(
                    "type", "edited",
                    "lobbyId", id.toString(),
                    "name", body.name()
                )));

                ctx.status(204);
            });
        });

        app.start(port);


    }
}
