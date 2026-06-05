package com.cipher.user.application.dto;

import com.cipher.user.domain.User;
import java.util.UUID;

public record UserSummary(
        UUID userId,
        String displayName,
        String tag,
        String handle) {

    public static UserSummary from(User user) {
        return new UserSummary(
                user.getId(),
                user.getDisplayName(),
                user.getTag(),
                user.handle());
    }
}
