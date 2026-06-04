package com.cipher.user.application;

import com.cipher.user.presentation.dto.UpdateProfileRequest;
import com.cipher.user.application.dto.UserSummary;
import com.cipher.user.application.provider.TagAllocator;
import com.cipher.user.domain.User;
import com.cipher.user.domain.repository.UserRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final TagAllocator tagAllocator;

    @Transactional(readOnly = true)
    public UserSummary me(UUID userId) {
        return UserSummary.from(getUser(userId));
    }

    @Transactional
    public UserSummary updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = getUser(userId);
        String newName = request.displayName();
        // 이름이 바뀌고 (새이름, 현재태그) 가 중복되면 태그를 재할당
        if (newName != null && !newName.isBlank() && !newName.equals(user.getDisplayName())
                && userRepository.existsByDisplayNameAndTag(newName, user.getTag())) {
            user.assignTag(tagAllocator.allocate(newName));
        }
        user.changeProfile(newName);
        return UserSummary.from(user);
    }

    private User getUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
    }
}
