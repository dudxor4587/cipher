package com.cipher.chat.domain;

import com.cipher.common.domain.BaseEntity;
import com.cipher.user.domain.User;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "room_members", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"room_id", "user_id"})
})
@Getter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RoomMember extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id")
    private ChatRoom room;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    /** 이 멤버가 마지막으로 읽은 시점. null = 아직 아무것도 안 읽음. (UUID PK라 메시지 id로 비교 불가 → 시각 기준) */
    private LocalDateTime lastReadAt;

    /** 방을 나간 시점. null = 활성 멤버. (소프트 나가기 — 남은 사람 표시·재등장을 위해 삭제하지 않음) */
    private LocalDateTime leftAt;

    /** 이 시점 이후 메시지만 보임. null = 처음부터. (나간 뒤 재등장 시 이전 기록을 숨기기 위함, 카톡식) */
    private LocalDateTime messagesVisibleFrom;

    public void updateLastRead(LocalDateTime readAt) {
        if (readAt != null && (this.lastReadAt == null || readAt.isAfter(this.lastReadAt))) {
            this.lastReadAt = readAt;
        }
    }

    public boolean isActive() {
        return leftAt == null;
    }

    public void leave(LocalDateTime at) {
        this.leftAt = at;
        this.messagesVisibleFrom = at; // 나간 시점 이전 기록은 안 보이게
    }

    /** 상대가 메시지를 보내 다시 합류(1:1에서 나간 사람 재등장). 가시성 컷오프는 유지 → 나간 이후만 보임. */
    public void rejoin() {
        this.leftAt = null;
    }

    /** 단체방 재초대로 다시 합류 — 가시성 컷오프를 초대 시점으로 옮김(자기 퇴장 메시지·이전 기록 안 보이게). */
    public void rejoinFresh(LocalDateTime at) {
        this.leftAt = null;
        this.messagesVisibleFrom = at;
    }
}
