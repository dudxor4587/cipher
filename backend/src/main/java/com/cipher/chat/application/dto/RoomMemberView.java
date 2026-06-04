package com.cipher.chat.application.dto;

import java.util.UUID;

/**
 * 방 멤버를 "조회하는 사람(viewer)" 기준으로 표현.
 * 위장/프라이버시: 친구도 본인도 아닌 멤버는 tag 를 가린다(null).
 * friend=false 인 멤버는 프론트에서 "친구 추가" 버튼을 노출(같은 방이므로 userId로 바로 추가 가능).
 */
public record RoomMemberView(
        UUID userId,
        String displayName,
        String tag,      // 친구/본인만 노출, 아니면 null
        boolean friend,
        boolean me) {
}
