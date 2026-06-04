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

        // 보낸 사람은 자기가 보낸 메시지까지 읽음 처리 (createdAt 은 저장 시 자동 기록됨)
        membership.updateLastRead(message.getCreatedAt());

        // 1:1에서 상대가 나갔다면, 메시지를 보내면 다시 합류시킨다(카톡식 재등장)
        if (!room.isGroup()) {
            memberRepository.findByRoom(room).stream()
                    .filter(m -> !m.isActive())
                    .forEach(RoomMember::rejoin);
        }

        return MessageResponse.from(message);
    }

    @Transactional(readOnly = true)
    public CursorPage<MessageResponse> history(UUID userId, UUID roomId, UUID beforeId, int size) {
        ChatRoom room = getRoom(roomId);
        User user = getUser(userId);
        RoomMember membership = memberRepository.findByRoomAndUser(room, user)
                .orElseThrow(() -> new IllegalArgumentException("방 멤버가 아닙니다."));

        // size+1 조회 → 더 과거 메시지가 남았는지(hasNext) 판별
        PageRequest page = PageRequest.of(0, size + 1);
        // 커서: beforeId 메시지의 createdAt 이전 것들 (UUID 라 id 비교 불가 → 시각 기준)
        LocalDateTime before = (beforeId == null) ? null
                : messageRepository.findById(beforeId).map(Message::getCreatedAt).orElse(null);
        // 나간 뒤 재등장한 멤버는 나간 시점 이후 메시지만 보임
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

        // 최신순 조회 → 화면 표시용으로 오래된순 정렬
        List<MessageResponse> content = pageItems.stream()
                .map(MessageResponse::from)
                .sorted(Comparator.comparing(MessageResponse::createdAt))
                .toList();

        // 다음(더 과거) 커서 = 이번 페이지에서 가장 오래된 메시지 id
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
