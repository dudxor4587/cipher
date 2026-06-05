package com.cipher.auth.presentation;

import com.cipher.auth.application.AuthService;
import com.cipher.auth.application.dto.TokenResponse;
import com.cipher.auth.presentation.dto.LoginRequest;
import com.cipher.auth.presentation.dto.SignupRequest;
import com.cipher.common.ratelimit.RateLimiter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final long HOUR = Duration.ofHours(1).toMillis();
    private static final long MINUTE = Duration.ofMinutes(1).toMillis();

    private final AuthService authService;
    private final RateLimiter rateLimiter;

    @PostMapping("/signup")
    public ResponseEntity<TokenResponse> signup(@Valid @RequestBody SignupRequest request,
                                                HttpServletRequest http) {

        rateLimiter.check("signup:" + clientIp(http), 5, HOUR);
        return ResponseEntity.ok(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request,
                                               HttpServletRequest http) {

        rateLimiter.check("login:" + clientIp(http), 10, MINUTE);
        return ResponseEntity.ok(authService.login(request));
    }

    private String clientIp(HttpServletRequest http) {
        String forwarded = http.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return http.getRemoteAddr();
    }
}
