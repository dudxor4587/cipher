package com.cipher.chat.domain.repository;
import com.cipher.chat.domain.Message;

import com.cipher.chat.domain.ChatRoom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, UUID> {

    // UUID PK 라 id 순서가 없으므로 createdAt 기준으로 정렬/커서.
    List<Message> findByRoomOrderByCreatedAtDesc(ChatRoom room, Pageable pageable);

    // 커서: before(=마지막으로 본 메시지의 createdAt) 이전 메시지
    List<Message> findByRoomAndCreatedAtLessThanOrderByCreatedAtDesc(
            ChatRoom room, LocalDateTime before, Pageable pageable);

    // 가시성 컷오프(visibleFrom) 이후만 — 나간 뒤 재등장한 멤버용
    List<Message> findByRoomAndCreatedAtAfterOrderByCreatedAtDesc(
            ChatRoom room, LocalDateTime after, Pageable pageable);

    List<Message> findByRoomAndCreatedAtAfterAndCreatedAtLessThanOrderByCreatedAtDesc(
            ChatRoom room, LocalDateTime after, LocalDateTime before, Pageable pageable);

    // 안읽음: 내가 마지막 읽은 시각 이후 메시지 수
    long countByRoomAndCreatedAtAfter(ChatRoom room, LocalDateTime after);

    long countByRoom(ChatRoom room);

    void deleteByRoom(ChatRoom room);
}
