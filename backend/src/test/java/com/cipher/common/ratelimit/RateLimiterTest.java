package com.cipher.common.ratelimit;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.cipher.common.exception.RateLimitExceededException;
import org.junit.jupiter.api.Test;

class RateLimiterTest {

    private final RateLimiter limiter = new RateLimiter();

    @Test
    void 한도까지_허용하고_초과하면_차단() {
        String key = "signup:1.2.3.4";
        for (int i = 0; i < 3; i++) {
            limiter.check(key, 3, 60_000);
        }
        assertThatThrownBy(() -> limiter.check(key, 3, 60_000))
                .isInstanceOf(RateLimitExceededException.class);
    }

    @Test
    void 윈도우가_지나면_리셋된다() throws InterruptedException {
        String key = "login:5.6.7.8";
        limiter.check(key, 1, 100);
        assertThatThrownBy(() -> limiter.check(key, 1, 100))
                .isInstanceOf(RateLimitExceededException.class);

        Thread.sleep(130);
        assertThatCode(() -> limiter.check(key, 1, 100)).doesNotThrowAnyException();
    }

    @Test
    void 키가_다르면_독립적으로_카운트() {
        assertThatCode(() -> {
            limiter.check("a", 1, 60_000);
            limiter.check("b", 1, 60_000);
        }).doesNotThrowAnyException();
    }
}
