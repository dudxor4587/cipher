package com.cipher.chat.domain;

import com.cipher.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "chat_rooms")
@Getter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatRoom extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomType type;

    private String title;

    public void changeTitle(String title) {
        this.title = title;
    }

    public boolean isGroup() {
        return type == RoomType.GROUP;
    }

    /** 1:1 방에 멤버를 초대하면 단체방으로 승격. */
    public void promoteToGroup() {
        this.type = RoomType.GROUP;
    }
}
