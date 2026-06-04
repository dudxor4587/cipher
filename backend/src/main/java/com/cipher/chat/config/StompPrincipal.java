package com.cipher.chat.config;

import java.security.Principal;
import java.util.UUID;

/** STOMP 세션의 인증 주체. name = userId 문자열(UUID). */
public record StompPrincipal(UUID userId, String displayName) implements Principal {

    @Override
    public String getName() {
        return userId.toString();
    }
}
