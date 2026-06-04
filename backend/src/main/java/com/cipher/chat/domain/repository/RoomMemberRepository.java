package com.cipher.chat.domain.repository;
import com.cipher.chat.domain.RoomMember;
import com.cipher.chat.domain.ChatRoom;

import com.cipher.user.domain.User;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RoomMemberRepository extends JpaRepository<RoomMember, UUID> {

    List<RoomMember> findByUser(User user);

    /** 내가 아직 안 나간(활성) 방 멤버십만. */
    List<RoomMember> findByUserAndLeftAtIsNull(User user);

    List<RoomMember> findByRoom(ChatRoom room);

    void deleteByRoom(ChatRoom room);

    Optional<RoomMember> findByRoomAndUser(ChatRoom room, User user);

    boolean existsByRoomAndUser(ChatRoom room, User user);

    /** 두 유저가 같은 방에 함께 속해 있는지 (멤버 목록에서 바로 친구추가 허용 조건). */
    @Query("""
            select count(m) > 0 from RoomMember m
            where m.user.id = :a
              and m.room.id in (
                  select m2.room.id from RoomMember m2 where m2.user.id = :b
              )
            """)
    boolean existsSharedRoom(@Param("a") UUID a, @Param("b") UUID b);
}
