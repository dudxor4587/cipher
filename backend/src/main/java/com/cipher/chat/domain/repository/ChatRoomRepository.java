package com.cipher.chat.domain.repository;
import com.cipher.chat.domain.ChatRoom;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, UUID> {

    @Query("""
            select rm.room from RoomMember rm
            where rm.user.id = :a
              and rm.room.type = com.cipher.chat.domain.RoomType.DIRECT
              and rm.room.id in (
                  select rm2.room.id from RoomMember rm2 where rm2.user.id = :b
              )
            """)
    List<ChatRoom> findDirectRoomsBetween(@Param("a") UUID a, @Param("b") UUID b);
}
