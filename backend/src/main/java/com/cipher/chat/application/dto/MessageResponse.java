package com.cipher.chat.application.dto;

import com.cipher.chat.domain.Message;
import com.cipher.chat.domain.MessageType;
import com.cipher.user.domain.User;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 테마와 무관한 도메인 메시지 표현.
 * 프론트가 senderId === 내 userId 로 mine(=user turn) 여부를 판단하고,
 * 단체방에서는 senderName 을 발신자 라벨로 렌더링한다.
 * type=SYSTEM 이면 발신자 없음(입장/퇴장 안내) → 가운데 안내문으로 표시.
 */
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
