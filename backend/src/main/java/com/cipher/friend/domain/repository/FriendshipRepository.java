package com.cipher.friend.domain.repository;
import com.cipher.friend.domain.Friendship;

import com.cipher.user.domain.User;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FriendshipRepository extends JpaRepository<Friendship, UUID> {

    List<Friendship> findByOwner(User owner);

    boolean existsByOwnerAndFriend(User owner, User friend);

    Optional<Friendship> findByOwnerAndFriend(User owner, User friend);
}
