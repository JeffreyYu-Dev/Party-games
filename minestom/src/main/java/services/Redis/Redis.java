package services.redis;

import io.lettuce.core.RedisClient;

public class Redis {
    private final RedisClient client;

    public Redis(String url) {
        this.client = RedisClient.create(url);
    }
}
