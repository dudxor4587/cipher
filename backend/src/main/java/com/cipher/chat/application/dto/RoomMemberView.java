package com.cipher.chat.application.dto;

import java.util.UUID;

public record RoomMemberView(
        UUID userId,
        String displayName,
        String tag,
        boolean friend,
        boolean me) {
}
