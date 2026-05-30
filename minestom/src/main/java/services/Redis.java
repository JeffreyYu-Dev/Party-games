package services;

import io.lettuce.core.RedisClient;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.pubsub.RedisPubSubAdapter;
import io.lettuce.core.pubsub.StatefulRedisPubSubConnection;

import java.util.function.BiConsumer;

public class Redis {
    private final RedisClient client;
    private final StatefulRedisConnection<String, String> connection;
    private StatefulRedisPubSubConnection<String, String> pubSubConnection;

    public Redis(String url) {
        this.client = RedisClient.create(url);
        this.connection = this.client.connect();
    }

    public void publish(String channel, String message) {
        this.connection.async().publish(channel, message);
    }

    public void subscribe(String channel, BiConsumer<String, String> handler) {
        if (pubSubConnection == null) {
            pubSubConnection = client.connectPubSub();
        }

        pubSubConnection.addListener(new RedisPubSubAdapter<>() {
            @Override
            public void message(String ch, String message) {
                if (ch.equals(channel)) handler.accept(ch, message);
            }
        });

        pubSubConnection.async().subscribe(channel);
    }

    public void shutdown() {
        if (pubSubConnection != null) pubSubConnection.close();
        this.connection.close();
        this.client.shutdown();
    }
}
