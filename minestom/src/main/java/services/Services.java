package services;

import services.redis.Redis;

public class Services {
    private static Redis redis;

    public static void init(Redis r) {
        redis = r;
    }

    public static Redis redis() {
        return redis;
    }
}
