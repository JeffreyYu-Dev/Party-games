package services;

import io.lettuce.core.RedisClient;
import io.lettuce.core.pubsub.RedisPubSubAdapter;
import io.lettuce.core.pubsub.StatefulRedisPubSubConnection;

public class Redis {
    private final RedisClient client;
    private final StatefulRedisPubSubConnection<String, String> pubConnection;
    private final StatefulRedisPubSubConnection<String, String> subConnection;

    public Redis(String url) {
        this.client = RedisClient.create(url);
        this.pubConnection = this.client.connectPubSub();
        this.subConnection = this.client.connectPubSub();

        subConnection.addListener(new RedisPubSubAdapter<String, String>() {
            @Override
            public void message(String channel, String message) {
                handleMessage(channel, message);
            }
        });

    }

    public void subscribe(String... channels) {
        this.subConnection.sync().subscribe(channels);
    }

    public void publish(String channel, String message) {
        this.pubConnection.async().publish(channel, message);
    }


    private void handleMessage(String channel, String message) {
        System.out.println("[" + channel + "] " + message);
        // dispatch to your Minestom logic here

//        handle messages HERE  

    }

    public void shutdown() {
        this.pubConnection.close();
        this.subConnection.close();
        client.shutdown();
    }
}
