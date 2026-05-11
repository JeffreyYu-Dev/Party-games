package services;

import io.lettuce.core.RedisClient;
import io.lettuce.core.api.StatefulRedisConnection;

public class Redis {
    private final RedisClient client;
    private final StatefulRedisConnection<String, String> connection;

    public Redis(String url) {
        this.client = RedisClient.create(url);
        this.connection = this.client.connect();
    }

    public void publish(String channel, String message) {
        this.connection.async().publish(channel, message);
    }

    public void shutdown() {
        this.connection.close();
        this.client.shutdown();
    }
}