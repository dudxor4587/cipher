package com.cipher.user.application.dto;

import com.cipher.user.domain.User;
import java.util.UUID;

/** 유저 표현 공통 DTO. 친구/멤버/검색/프로필에 모두 사용. handle = 이름#태그. */
public record UserSummary(
        UUID userId,
        String displayName,
        String tag,
        String handle) {

    public static UserSummary from(User user) {
        return new UserSummary(
                user.getId(),
                user.getDisplayName(),
                user.getTag(),
                user.handle());
    }
}
