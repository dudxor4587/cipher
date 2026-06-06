package com.cipher.chat.application;

import com.cipher.chat.application.dto.MessageResponse;
import com.cipher.common.dto.CursorPage;
import com.cipher.chat.domain.Message;
import com.cipher.chat.domain.repository.MessageRepository;
import com.cipher.chat.domain.ChatRoom;
import com.cipher.chat.domain.repository.ChatRoomRepository;
import com.cipher.chat.domain.RoomMember;
import com.cipher.chat.domain.repository.RoomMemberRepository;
import com.cipher.user.domain.User;
import com.cipher.user.domain.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final ChatRoomRepository roomRepository;
    private final RoomMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public MessageResponse send(UUID senderId, UUID roomId, String content) {
        ChatRoom room = getRoom(roomId);
        User sender = getUser(senderId);
        RoomMember membership = memberRepository.findByRoomAndUser(room, sender)
                .orElseThrow(() -> new IllegalArgumentException("방 멤버가 아닙니다."));

        Message message = messageRepository.save(Message.builder()
                .room(room)
                .sender(sender)
                .type(com.cipher.chat.domain.MessageType.CHAT)
                .content(content)
                .build());

        membership.updateLastRead(message.getCreatedAt());

        if (!room.isGroup()) {
            memberRepository.findByRoom(room).stream()
                    .filter(m -> !m.isActive())
                    .forEach(RoomMember::rejoin);
        }

        List<UUID> recipients = memberRepository.findByRoom(room).stream()
                .filter(RoomMember::isActive)
                .map(m -> m.getUser().getId())
                .filter(id -> !id.equals(senderId))
                .toList();
        if (!recipients.isEmpty()) {
            eventPublisher.publishEvent(new NewMessageEvent(roomId, recipients));
        }

        return MessageResponse.from(message);
    }

    @Transactional(readOnly = true)
    public CursorPage<MessageResponse> history(UUID userId, UUID roomId, UUID beforeId, int size) {
        ChatRoom room = getRoom(roomId);
        User user = getUser(userId);
        RoomMember membership = memberRepository.findByRoomAndUser(room, user)
                .orElseThrow(() -> new IllegalArgumentException("방 멤버가 아닙니다."));

        PageRequest page = PageRequest.of(0, size + 1);

        LocalDateTime before = (beforeId == null) ? null
                : messageRepository.findById(beforeId).map(Message::getCreatedAt).orElse(null);

        LocalDateTime visibleFrom = membership.getMessagesVisibleFrom();

        List<Message> fetched;
        if (before == null) {
            fetched = (visibleFrom == null)
                    ? messageRepository.findByRoomOrderByCreatedAtDesc(room, page)
                    : messageRepository.findByRoomAndCreatedAtAfterOrderByCreatedAtDesc(room, visibleFrom, page);
        } else {
            fetched = (visibleFrom == null)
                    ? messageRepository.findByRoomAndCreatedAtLessThanOrderByCreatedAtDesc(room, before, page)
                    : messageRepository.findByRoomAndCreatedAtAfterAndCreatedAtLessThanOrderByCreatedAtDesc(
                            room, visibleFrom, before, page);
        }

        boolean hasNext = fetched.size() > size;
        List<Message> pageItems = hasNext ? fetched.subList(0, size) : fetched;

        List<MessageResponse> content = pageItems.stream()
                .map(MessageResponse::from)
                .sorted(Comparator.comparing(MessageResponse::createdAt))
                .toList();

        UUID nextCursor = content.isEmpty() ? null : content.get(0).id();
        return new CursorPage<>(content, hasNext, nextCursor);
    }

    @Transactional
    public void markRead(UUID userId, UUID roomId, UUID lastReadMessageId) {
        ChatRoom room = getRoom(roomId);
        User user = getUser(userId);
        RoomMember membership = memberRepository.findByRoomAndUser(room, user)
                .orElseThrow(() -> new IllegalArgumentException("방 멤버가 아닙니다."));
        messageRepository.findById(lastReadMessageId)
                .ifPresent(m -> membership.updateLastRead(m.getCreatedAt()));
    }

    private ChatRoom getRoom(UUID roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 방입니다."));
    }

    private User getUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
    }
}
