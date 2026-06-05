package com.cipher.chat.domain.repository;
import com.cipher.chat.domain.Message;

import com.cipher.chat.domain.ChatRoom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, UUID> {

    List<Message> findByRoomOrderByCreatedAtDesc(ChatRoom room, Pageable pageable);

    List<Message> findByRoomAndCreatedAtLessThanOrderByCreatedAtDesc(
            ChatRoom room, LocalDateTime before, Pageable pageable);

    List<Message> findByRoomAndCreatedAtAfterOrderByCreatedAtDesc(
            ChatRoom room, LocalDateTime after, Pageable pageable);

    List<Message> findByRoomAndCreatedAtAfterAndCreatedAtLessThanOrderByCreatedAtDesc(
            ChatRoom room, LocalDateTime after, LocalDateTime before, Pageable pageable);

    long countByRoomAndCreatedAtAfter(ChatRoom room, LocalDateTime after);

    long countByRoom(ChatRoom room);

    void deleteByRoom(ChatRoom room);
}
