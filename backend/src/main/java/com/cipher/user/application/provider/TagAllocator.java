package com.cipher.user.application.provider;
import com.cipher.user.domain.repository.UserRepository;

import java.util.concurrent.ThreadLocalRandom;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TagAllocator {

    private static final int MAX_ATTEMPTS = 100;

    private final UserRepository userRepository;

    public String allocate(String displayName) {
        for (int i = 0; i < MAX_ATTEMPTS; i++) {
            String tag = String.format("%04d", ThreadLocalRandom.current().nextInt(10000));
            if (!userRepository.existsByDisplayNameAndTag(displayName, tag)) {
                return tag;
            }
        }
        throw new IllegalArgumentException("동일한 이름이 너무 많습니다. 다른 표시 이름을 사용해주세요.");
    }
}
