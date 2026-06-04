package com.cipher.common.crypto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class ContentCryptoConverterTest {

    private final ContentCryptoConverter converter = new ContentCryptoConverter("unit-test-key");

    @Test
    void 암호화_복호화_라운드트립() {
        String plain = "밥, 점심 뭐 먹을래? 🍚";
        String encrypted = converter.convertToDatabaseColumn(plain);

        assertThat(encrypted).isNotNull().isNotEqualTo(plain);
        assertThat(converter.convertToEntityAttribute(encrypted)).isEqualTo(plain);
    }

    @Test
    void 같은_평문도_매번_다른_암호문_IV랜덤() {
        String plain = "동일한 메시지";
        String a = converter.convertToDatabaseColumn(plain);
        String b = converter.convertToDatabaseColumn(plain);

        assertThat(a).isNotEqualTo(b); // IV 가 매번 달라 암호문도 다름
        assertThat(converter.convertToEntityAttribute(a)).isEqualTo(plain);
        assertThat(converter.convertToEntityAttribute(b)).isEqualTo(plain);
    }

    @Test
    void null_은_그대로_null() {
        assertThat(converter.convertToDatabaseColumn(null)).isNull();
        assertThat(converter.convertToEntityAttribute(null)).isNull();
    }
}
