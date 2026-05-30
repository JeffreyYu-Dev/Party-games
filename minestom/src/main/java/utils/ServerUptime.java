package utils;

import java.time.Duration;
import java.time.Instant;

public class ServerUptime {
    private final Instant startTime = Instant.now();

    public long getStartEpochSecond() {
        return startTime.getEpochSecond();
    }

    public Duration getUptime() {
        return Duration.between(startTime, Instant.now());
    }
}