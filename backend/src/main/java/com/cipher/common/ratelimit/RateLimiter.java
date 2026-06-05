package com.cipher.common.ratelimit;

import com.cipher.common.exception.RateLimitExceededException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.stereotype.Component;

@Component
public class RateLimiter {

    private record Window(long resetAt, AtomicInteger count) {}

    private final ConcurrentHashMap<String, Window> buckets = new ConcurrentHashMap<>();

    public void check(String key, int limit, long windowMs) {
        long now = System.currentTimeMillis();
        Window window = buckets.compute(key, (k, cur) ->
                (cur == null || now >= cur.resetAt())
                        ? new Window(now + windowMs, new AtomicInteger(0))
                        : cur);
        if (window.count().incrementAndGet() > limit) {
            throw new RateLimitExceededException("요청이 너무 많습니다. 잠시 후 다시 시도해주세요.");
        }
    }
}
