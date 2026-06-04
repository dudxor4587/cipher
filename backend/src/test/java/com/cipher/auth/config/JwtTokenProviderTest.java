package com.cipher.auth.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;
import org.junit.jupiter.api.Test;

class JwtTokenProviderTest {

    private final JwtTokenProvider provider =
            new JwtTokenProvider("test-secret-key-0123456789-0123456789-abcdef", 3_600_000L);

    @Test
    void 발급_파싱_라운드트립() {
        UUID userId = UUID.randomUUID();
        String token = provider.createToken(userId, "앨리스");

        assertThat(provider.isValid(token)).isTrue();
        assertThat(provider.getUserId(token)).isEqualTo(userId);
        assertThat(provider.getDisplayName(token)).isEqualTo("앨리스");
    }

    @Test
    void 변조되거나_엉뚱한_토큰은_invalid() {
        String token = provider.createToken(UUID.randomUUID(), "밥");
        assertThat(provider.isValid(token + "tampered")).isFalse();
        assertThat(provider.isValid("garbage")).isFalse();
    }
}
