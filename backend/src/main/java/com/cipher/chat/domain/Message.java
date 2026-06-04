package com.cipher.chat.domain;

import com.cipher.common.crypto.ContentCryptoConverter;
import com.cipher.common.domain.BaseEntity;
import com.cipher.user.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "messages")
@Getter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Message extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id")
    private ChatRoom room;

    // 시스템 메시지(입장/퇴장 등)는 발신자가 없으므로 nullable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    private User sender;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageType type;

    // 본문은 AES-256-GCM 으로 암호화 저장 → 암호문(base64)이 길어지므로 컬럼도 넉넉히
    @Convert(converter = ContentCryptoConverter.class)
    @Column(nullable = false, length = 20000)
    private String content;

    // 메시지 시각/정렬은 BaseEntity.createdAt(LocalDateTime) 사용 (UUID PK라 id 순서 불가)
}
