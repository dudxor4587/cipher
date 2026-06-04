package com.cipher.user.domain.repository;
import com.cipher.user.domain.User;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByLoginId(String loginId);

    boolean existsByLoginId(String loginId);

    boolean existsByDisplayNameAndTag(String displayName, String tag);

    Optional<User> findByDisplayNameAndTag(String displayName, String tag);
}
