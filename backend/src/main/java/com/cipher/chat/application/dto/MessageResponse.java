package com.cipher.chat.application.dto;

import com.cipher.chat.domain.Message;
import com.cipher.chat.domain.MessageType;
import com.cipher.user.domain.User;
import java.time.LocalDateTime;
import java.util.UUID;

public record MessageResponse(
        UUID id,
        UUID roomId,
        UUID senderId,
        String senderName,
        String content,
        LocalDateTime createdAt,
        MessageType type) {

    public static MessageResponse from(Message message) {
        User sender = message.getSender();
        return new MessageResponse(
                message.getId(),
                message.getRoom().getId(),
                sender == null ? null : sender.getId(),
                sender == null ? null : sender.getDisplayName(),
                message.getContent(),
                message.getCreatedAt(),
                message.getType());
    }
}
