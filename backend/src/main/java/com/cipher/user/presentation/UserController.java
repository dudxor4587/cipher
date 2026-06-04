package com.cipher.user.presentation;
import com.cipher.user.application.UserService;

import com.cipher.user.presentation.dto.UpdateProfileRequest;
import com.cipher.user.application.dto.UserSummary;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserSummary> me(@AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(userService.me(userId));
    }

    @PatchMapping("/me")
    public ResponseEntity<UserSummary> updateProfile(@AuthenticationPrincipal UUID userId,
                                                     @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(userId, request));
    }
}
