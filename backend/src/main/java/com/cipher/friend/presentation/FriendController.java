package com.cipher.friend.presentation;
import com.cipher.friend.application.FriendService;

import com.cipher.common.ratelimit.RateLimiter;
import com.cipher.friend.presentation.dto.AddFriendRequest;
import com.cipher.user.application.dto.UserSummary;
import jakarta.validation.Valid;
import java.time.Duration;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;
    private final RateLimiter rateLimiter;

    @GetMapping
    public ResponseEntity<List<UserSummary>> list(@AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(friendService.listFriends(userId));
    }

    @PostMapping
    public ResponseEntity<UserSummary> add(@AuthenticationPrincipal UUID userId,
                                           @Valid @RequestBody AddFriendRequest request) {
        // 태그(4자리) 무차별 대입 방지: 계정당 시간당 20회
        rateLimiter.check("friend-add:" + userId, 20, Duration.ofHours(1).toMillis());
        return ResponseEntity.ok(friendService.addByHandle(userId, request.handle()));
    }

    /** 같은 방 멤버를 userId 로 바로 추가 (멤버 목록의 "친구 추가" 버튼). */
    @PostMapping("/by-user/{targetId}")
    public ResponseEntity<UserSummary> addByUser(@AuthenticationPrincipal UUID userId,
                                                 @PathVariable UUID targetId) {
        rateLimiter.check("friend-add:" + userId, 20, Duration.ofHours(1).toMillis());
        return ResponseEntity.ok(friendService.addByUserId(userId, targetId));
    }

    @DeleteMapping("/{friendId}")
    public ResponseEntity<Void> remove(@AuthenticationPrincipal UUID userId,
                                       @PathVariable UUID friendId) {
        friendService.remove(userId, friendId);
        return ResponseEntity.ok().build();
    }
}
