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

    private LocalDateTime lastReadAt;

    private LocalDateTime leftAt;

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
        this.messagesVisibleFrom = at;
    }

    public void rejoin() {
        this.leftAt = null;
    }

    public void rejoinFresh(LocalDateTime at) {
        this.leftAt = null;
        this.messagesVisibleFrom = at;
    }
}
