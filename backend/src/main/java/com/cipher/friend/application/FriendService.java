package com.cipher.friend.application;

import com.cipher.user.application.dto.UserSummary;
import com.cipher.chat.domain.repository.RoomMemberRepository;
import com.cipher.friend.domain.Friendship;
import com.cipher.friend.domain.repository.FriendshipRepository;
import com.cipher.user.domain.User;
import com.cipher.user.domain.repository.UserRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FriendService {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;
    private final RoomMemberRepository roomMemberRepository;

    @Transactional
    public UserSummary addByHandle(UUID meId, String handle) {
        int hash = handle.lastIndexOf('#');
        if (hash <= 0 || hash == handle.length() - 1) {
            throw new IllegalArgumentException("올바른 형식이 아닙니다. 예: 앨리스#0042");
        }
        String name = handle.substring(0, hash).trim();
        String tag = handle.substring(hash + 1).trim();

        User target = userRepository.findByDisplayNameAndTag(name, tag)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자를 찾을 수 없습니다: " + handle));
        if (target.getId().equals(meId)) {
            throw new IllegalArgumentException("자기 자신은 친구로 추가할 수 없습니다.");
        }
        User me = getUser(meId);

        link(me, target);
        link(target, me);
        return UserSummary.from(target);
    }

    @Transactional
    public UserSummary addByUserId(UUID meId, UUID targetId) {
        if (meId.equals(targetId)) {
            throw new IllegalArgumentException("자기 자신은 친구로 추가할 수 없습니다.");
        }
        if (!roomMemberRepository.existsSharedRoom(meId, targetId)) {
            throw new IllegalArgumentException("같은 대화방에 있는 사람만 바로 추가할 수 있습니다.");
        }
        User me = getUser(meId);
        User target = getUser(targetId);
        link(me, target);
        link(target, me);
        return UserSummary.from(target);
    }

    @Transactional(readOnly = true)
    public List<UserSummary> listFriends(UUID meId) {
        return friendshipRepository.findByOwner(getUser(meId)).stream()
                .map(f -> UserSummary.from(f.getFriend()))
                .sorted((a, b) -> a.displayName().compareToIgnoreCase(b.displayName()))
                .toList();
    }

    @Transactional
    public void remove(UUID meId, UUID friendId) {
        User me = getUser(meId);
        User friend = getUser(friendId);
        friendshipRepository.findByOwnerAndFriend(me, friend)
                .ifPresent(friendshipRepository::delete);
        friendshipRepository.findByOwnerAndFriend(friend, me)
                .ifPresent(friendshipRepository::delete);
    }

    private void link(User owner, User friend) {
        if (!friendshipRepository.existsByOwnerAndFriend(owner, friend)) {
            friendshipRepository.save(Friendship.builder().owner(owner).friend(friend).build());
        }
    }

    private User getUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
    }
}
