package services;

public class AppContext {
    private static Redis redis;
    private static BackendClient backend;

    public static void init(Redis redis, BackendClient backend) {
        AppContext.redis = redis;
        AppContext.backend = backend;
    }

    public static Redis redis() {
        if (redis == null) throw new IllegalStateException("AppContext not initialized");
        return redis;
    }

    public static BackendClient backend() {
        if (backend == null) throw new IllegalStateException("AppContext not initialized");
        return backend;
    }
}
