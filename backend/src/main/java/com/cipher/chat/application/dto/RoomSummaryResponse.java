package com.cipher.chat.application.dto;

import com.cipher.chat.domain.RoomType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record RoomSummaryResponse(
        UUID id,
        RoomType type,
        String title,
        List<RoomMemberView> members,
        String lastMessage,
        LocalDateTime lastMessageAt,
        long unreadCount) {
}
