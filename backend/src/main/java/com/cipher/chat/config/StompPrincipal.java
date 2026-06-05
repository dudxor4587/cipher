package com.cipher.chat.config;

import java.security.Principal;
import java.util.UUID;

public record StompPrincipal(UUID userId, String displayName) implements Principal {

    @Override
    public String getName() {
        return userId.toString();
    }
}
