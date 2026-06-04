package com.cipher.auth.application;

import com.cipher.auth.presentation.dto.LoginRequest;
import com.cipher.auth.presentation.dto.SignupRequest;
import com.cipher.auth.application.dto.TokenResponse;
import com.cipher.auth.config.JwtTokenProvider;
import com.cipher.user.application.provider.TagAllocator;
import com.cipher.user.domain.User;
import com.cipher.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final TagAllocator tagAllocator;

    @Transactional
    public TokenResponse signup(SignupRequest request) {
        if (userRepository.existsByLoginId(request.loginId())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }
        User user = User.builder()
                .loginId(request.loginId())
                .password(passwordEncoder.encode(request.password()))
                .displayName(request.displayName())
                .tag(tagAllocator.allocate(request.displayName()))
                .build();
        userRepository.save(user);
        return issueToken(user);
    }

    @Transactional(readOnly = true)
    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByLoginId(request.loginId())
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다."));
        if (!user.matchesPassword(request.password(), passwordEncoder)) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.");
        }
        return issueToken(user);
    }

    private TokenResponse issueToken(User user) {
        String token = tokenProvider.createToken(user.getId(), user.getDisplayName());
        return new TokenResponse(token, user.getId(), user.getDisplayName(), user.getTag());
    }
}
