package services;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import instances.Lobby;
import instances.OnlineInstancesManager;
import io.javalin.Javalin;
import io.javalin.json.JavalinGson;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public class HttpServer {

    public HttpServer(int port) {
        Gson gson = new GsonBuilder().serializeNulls().create();

        Javalin app = Javalin.create(config -> {
            config.jsonMapper(new JavalinGson(gson, true));

//            TODO: add a route to get what maps are available

            config.routes.get("/maps", ctx -> {

                List<Lobby> lobbies = OnlineInstancesManager.getLobbies();
                List<Map<String, Object>> result = lobbies.stream().map(lobby -> Map.<String, Object>of(
                        "id", lobby.getId().toString(),
                        "name", lobby.getName(),
                        "players", lobby.getPlayerCount(),
                        "playerCap", lobby.getPlayerCap()
                )).toList();
                ctx.json(result);
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

                ctx.json(Map.of("removed", lobby.getId().toString(), "name", lobby.getName()));
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

                ctx.status(204);
            });
        });

        app.start(port);


    }
}
