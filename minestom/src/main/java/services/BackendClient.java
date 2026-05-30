package services;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class BackendClient {
    private final String baseUrl;
    private final String secret;
    private final HttpClient http;
    private final Gson gson;

    public BackendClient(String baseUrl, String secret) {
        this.baseUrl = baseUrl;
        this.secret = secret;
        this.http = HttpClient.newHttpClient();
        this.gson = new Gson();
    }

    public void upsertAccount(UUID id, String username) throws Exception {
        JsonObject body = new JsonObject();
        body.addProperty("id", id.toString());
        body.addProperty("username", username);

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/account"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(gson.toJson(body)))
                .build();

        HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());

        if (res.statusCode() != 200) throw new RuntimeException("Backend error: " + res.statusCode());
    }

    public UUID resolveUsername(String username) throws Exception {
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/account/username/" + username))
                .GET()
                .build();

        HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());

        if (res.statusCode() == 404) return null;
        if (res.statusCode() != 200) throw new RuntimeException("Backend error: " + res.statusCode());

        JsonObject body = gson.fromJson(res.body(), JsonObject.class);
        return UUID.fromString(body.get("id").getAsString());
    }

    public record Friend(String id, String username) {}

    public List<Friend> getFriends(UUID userId) throws Exception {
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/friends/list/" + userId))
                .header("X-Internal-Secret", secret)
                .GET()
                .build();

        HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
        if (res.statusCode() != 200) throw new RuntimeException("Backend error: " + res.statusCode());

        JsonArray arr = gson.fromJson(res.body(), JsonArray.class);
        List<Friend> friends = new ArrayList<>();
        for (var el : arr) {
            JsonObject obj = el.getAsJsonObject();
            friends.add(new Friend(obj.get("id").getAsString(), obj.get("username").getAsString()));
        }
        return friends;
    }

    public void sendFriendRequest(UUID requesterId, UUID receiverId) throws Exception {
        post("/friends/request", requesterId, receiverId);
    }

    public void acceptFriendRequest(UUID requesterId, UUID receiverId) throws Exception {
        post("/friends/accept", requesterId, receiverId);
    }

    public void declineFriendRequest(UUID requesterId, UUID receiverId) throws Exception {
        post("/friends/decline", requesterId, receiverId);
    }

    public void blockUser(UUID blockerId, UUID blockedId) throws Exception {
        JsonObject body = new JsonObject();
        body.addProperty("blockerId", blockerId.toString());
        body.addProperty("blockedId", blockedId.toString());
        postBody("/friends/block", body);
    }

    public void unblockUser(UUID blockerId, UUID blockedId) throws Exception {
        JsonObject body = new JsonObject();
        body.addProperty("blockerId", blockerId.toString());
        body.addProperty("blockedId", blockedId.toString());
        postBody("/friends/unblock", body);
    }

    public void removeFriend(UUID userId, UUID friendId) throws Exception {
        JsonObject body = new JsonObject();
        body.addProperty("userId", userId.toString());

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/friends/" + friendId))
                .header("Content-Type", "application/json")
                .header("X-Internal-Secret", secret)
                .method("DELETE", HttpRequest.BodyPublishers.ofString(gson.toJson(body)))
                .build();

        HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
        if (res.statusCode() != 200) throw new RuntimeException("Backend error: " + res.statusCode());
    }

    private void post(String path, UUID requesterId, UUID receiverId) throws Exception {
        JsonObject body = new JsonObject();
        body.addProperty("requesterId", requesterId.toString());
        body.addProperty("receiverId", receiverId.toString());
        postBody(path, body);
    }

    private void postBody(String path, JsonObject body) throws Exception {
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + path))
                .header("Content-Type", "application/json")
                .header("X-Internal-Secret", secret)
                .POST(HttpRequest.BodyPublishers.ofString(gson.toJson(body)))
                .build();

        HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
        if (res.statusCode() != 200) throw new RuntimeException("Backend error: " + res.statusCode());
    }
}
