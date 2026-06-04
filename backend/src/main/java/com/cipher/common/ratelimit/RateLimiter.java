package com.cipher.common.ratelimit;

import com.cipher.common.exception.RateLimitExceededException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.stereotype.Component;

/**
 * 인메모리 고정 윈도우 레이트리밋 (MVP·단일 인스턴스용).
 * 다중 인스턴스로 확장 시 Redis(INCR+EXPIRE)나 Bucket4j-Redis 로 교체.
 */
@Component
public class RateLimiter {

    private record Window(long resetAt, AtomicInteger count) {}

    private final ConcurrentHashMap<String, Window> buckets = new ConcurrentHashMap<>();

    /** key 에 대해 windowMs 동안 limit 회까지 허용. 초과 시 RateLimitExceededException. */
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
