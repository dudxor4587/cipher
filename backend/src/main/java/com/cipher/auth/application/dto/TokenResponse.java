package com.cipher.auth.application.dto;

import java.util.UUID;

public record TokenResponse(
        String accessToken,
        UUID userId,
        String displayName,
        String tag) {
}
