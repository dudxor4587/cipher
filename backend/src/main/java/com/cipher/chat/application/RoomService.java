package com.cipher.chat.application;

import com.cipher.chat.presentation.dto.CreateRoomRequest;
import com.cipher.chat.application.dto.MessageResponse;
import com.cipher.chat.application.dto.RoomMemberView;
import com.cipher.chat.application.dto.RoomSummaryResponse;
import com.cipher.chat.domain.Message;
import com.cipher.chat.domain.MessageType;
import com.cipher.chat.domain.repository.MessageRepository;
import com.cipher.chat.domain.ChatRoom;
import com.cipher.chat.domain.repository.ChatRoomRepository;
import com.cipher.chat.domain.RoomMember;
import com.cipher.chat.domain.repository.RoomMemberRepository;
import com.cipher.chat.domain.RoomType;
import com.cipher.friend.domain.repository.FriendshipRepository;
import com.cipher.user.domain.User;
import com.cipher.user.domain.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final ChatRoomRepository roomRepository;
    private final RoomMemberRepository memberRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final FriendshipRepository friendshipRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public RoomSummaryResponse createRoom(UUID creatorId, CreateRoomRequest request) {
        Set<UUID> memberIds = new LinkedHashSet<>();
        memberIds.add(creatorId);
        memberIds.addAll(request.memberIds());

        // 친구만 방에 넣을 수 있다 (낯선 사람과의 1:1/그룹 우회 차단)
        request.memberIds().forEach(memberId -> requireFriendship(creatorId, memberId));

        if (request.type() == RoomType.DIRECT) {
            if (memberIds.size() != 2) {
                throw new IllegalArgumentException("1:1 방은 정확히 2명이어야 합니다.");
            }
            // 이미 있는 1:1 방이면 재사용 (중복 생성 방지)
            UUID other = memberIds.stream().filter(id -> !id.equals(creatorId)).findFirst().orElseThrow();
            List<ChatRoom> existing = roomRepository.findDirectRoomsBetween(creatorId, other);
            if (!existing.isEmpty()) {
                ChatRoom room = existing.get(0);
                // 예전에 내가 나간 1:1 방이면 다시 합류시킨다 (안 그러면 목록에 안 떠서 진입 불가)
                memberRepository.findByRoomAndUser(room, getUser(creatorId))
                        .filter(m -> !m.isActive())
                        .ifPresent(RoomMember::rejoin);
                return toSummary(room, creatorId, friendIdsOf(creatorId));
            }
        }

        ChatRoom room = roomRepository.save(ChatRoom.builder()
                .type(request.type())
                .title(request.title())
                .build());

        for (UUID userId : memberIds) {
            addMember(room, userId);
        }
        // 새 방이 생겼다고 상대(생성자 제외)에게 개인 큐로 알림 → 새로고침 없이 목록에 등장
        memberIds.stream().filter(id -> !id.equals(creatorId))
                .forEach(id -> notifyRoomChanged(id, room.getId()));
        return toSummary(room, creatorId, friendIdsOf(creatorId));
    }

    @Transactional(readOnly = true)
    public List<RoomSummaryResponse> getMyRooms(UUID userId) {
        User user = getUser(userId);
        Set<UUID> friendIds = friendIdsOf(userId);
        List<RoomSummaryResponse> result = new ArrayList<>();
        for (RoomMember membership : memberRepository.findByUserAndLeftAtIsNull(user)) {
            result.add(toSummary(membership.getRoom(), userId, friendIds));
        }
        // 최근 메시지가 있는 방을 위로
        result.sort((a, b) -> {
            if (a.lastMessageAt() == null && b.lastMessageAt() == null) return 0;
            if (a.lastMessageAt() == null) return 1;
            if (b.lastMessageAt() == null) return -1;
            return b.lastMessageAt().compareTo(a.lastMessageAt());
        });
        return result;
    }

    @Transactional(readOnly = true)
    public RoomSummaryResponse getRoom(UUID userId, UUID roomId) {
        ChatRoom room = getRoomEntity(roomId);
        ensureMember(room, getUser(userId));
        return toSummary(room, userId, friendIdsOf(userId));
    }

    /** 단체방에 멤버 초대. 1:1 방이면 단체방으로 승격. */
    @Transactional
    public RoomSummaryResponse invite(UUID requesterId, UUID roomId, List<UUID> userIds) {
        ChatRoom room = getRoomEntity(roomId);
        User requester = getUser(requesterId);
        ensureMember(room, requester);
        // 초대하는 사람은 자기 친구만 넣을 수 있다 (낯선 사람을 그룹에 끌어들이는 스팸 차단)
        userIds.forEach(userId -> requireFriendship(requesterId, userId));
        if (room.getType() == RoomType.DIRECT) {
            room.promoteToGroup();
        }
        for (UUID userId : userIds) {
            User u = getUser(userId);
            // 이미 멤버면(나갔던 경우 포함) 재합류, 아니면 새로 추가
            memberRepository.findByRoomAndUser(room, u)
                    .ifPresentOrElse(RoomMember::rejoin, () -> addMember(room, userId));
            notifyRoomChanged(userId, room.getId()); // 초대받은 사람에게 실시간 알림
            postSystemMessage(room, requester.getDisplayName() + "님이 " + u.getDisplayName() + "님을 초대했습니다.");
        }
        return toSummary(room, requesterId, friendIdsOf(requesterId));
    }

    /** 나가기 = 소프트(leftAt 표시). 모두 나가면 방·메시지 정리. */
    @Transactional
    public void leave(UUID userId, UUID roomId) {
        ChatRoom room = getRoomEntity(roomId);
        User user = getUser(userId);
        RoomMember membership = memberRepository.findByRoomAndUser(room, user)
                .orElseThrow(() -> new IllegalArgumentException("방 멤버가 아닙니다."));
        membership.leave(LocalDateTime.now());

        boolean anyoneActive = memberRepository.findByRoom(room).stream().anyMatch(RoomMember::isActive);
        if (!anyoneActive) {
            messageRepository.deleteByRoom(room);
            memberRepository.deleteByRoom(room);
            roomRepository.delete(room);
            return;
        }
        // 단체방은 카톡처럼 "OO님이 나갔습니다" 안내 (1:1은 표시 안 함)
        if (room.isGroup()) {
            postSystemMessage(room, user.getDisplayName() + "님이 나갔습니다.");
        }
    }

    @Transactional
    public RoomSummaryResponse rename(UUID requesterId, UUID roomId, String title) {
        ChatRoom room = getRoomEntity(roomId);
        ensureMember(room, getUser(requesterId));
        room.changeTitle(title);
        return toSummary(room, requesterId, friendIdsOf(requesterId));
    }

    /** otherId 가 ownerId 의 친구인지 검증. 자기 자신은 통과. */
    private void requireFriendship(UUID ownerId, UUID otherId) {
        if (ownerId.equals(otherId)) {
            return;
        }
        boolean friends = friendshipRepository.existsByOwnerAndFriend(
                userRepository.getReferenceById(ownerId),
                userRepository.getReferenceById(otherId));
        if (!friends) {
            throw new IllegalArgumentException("친구만 대화에 추가할 수 있습니다.");
        }
    }

    /** 조회자(viewerId)의 친구 id 집합. 멤버 태그 마스킹/친구여부 표시에 사용. */
    private Set<UUID> friendIdsOf(UUID userId) {
        return friendshipRepository.findByOwner(userRepository.getReferenceById(userId)).stream()
                .map(f -> f.getFriend().getId())
                .collect(Collectors.toSet());
    }

    /** 시스템 안내 메시지(입장/퇴장)를 저장하고 방 토픽에 브로드캐스트. */
    private void postSystemMessage(ChatRoom room, String text) {
        Message msg = messageRepository.save(Message.builder()
                .room(room)
                .type(MessageType.SYSTEM)
                .content(text)
                .build());
        messagingTemplate.convertAndSend("/topic/rooms/" + room.getId(), MessageResponse.from(msg));
    }

    /** 해당 사용자 개인 큐로 "방 목록 변경" 신호 → 프론트가 새로고침 없이 loadRooms. */
    private void notifyRoomChanged(UUID userId, UUID roomId) {
        messagingTemplate.convertAndSendToUser(
                userId.toString(), "/queue/rooms", Map.of("roomId", roomId.toString()));
    }

    private void addMember(ChatRoom room, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자: " + userId));
        memberRepository.save(RoomMember.builder().room(room).user(user).build());
    }

    private RoomSummaryResponse toSummary(ChatRoom room, UUID viewerId, Set<UUID> friendIds) {
        List<RoomMember> members = memberRepository.findByRoom(room);
        // 단체방: 나간 사람은 참여자에서 제외(→ 재초대 가능, "나갔습니다" 후 사라짐).
        // 1:1: 상대가 나가도 이름을 계속 보여주려고 전부 포함.
        List<RoomMember> visible = room.isGroup()
                ? members.stream().filter(RoomMember::isActive).toList()
                : members;
        List<RoomMemberView> memberDtos = visible.stream()
                .map(m -> {
                    User u = m.getUser();
                    boolean me = u.getId().equals(viewerId);
                    boolean friend = friendIds.contains(u.getId());
                    String tag = (me || friend) ? u.getTag() : null; // 친구/본인 아니면 태그 가림
                    return new RoomMemberView(u.getId(), u.getDisplayName(), tag, friend, me);
                })
                .toList();

        List<Message> latest = messageRepository.findByRoomOrderByCreatedAtDesc(room, PageRequest.of(0, 1));
        String lastMessage = latest.isEmpty() ? null : latest.get(0).getContent();
        LocalDateTime lastMessageAt = latest.isEmpty() ? null : latest.get(0).getCreatedAt();

        long unread = members.stream()
                .filter(m -> m.getUser().getId().equals(viewerId))
                .findFirst()
                .map(m -> {
                    // 미읽음 기준선 = 마지막 읽은 시각과 가시성 컷오프 중 더 나중 것
                    LocalDateTime floor = m.getLastReadAt();
                    LocalDateTime visibleFrom = m.getMessagesVisibleFrom();
                    if (visibleFrom != null && (floor == null || visibleFrom.isAfter(floor))) {
                        floor = visibleFrom;
                    }
                    return floor == null
                            ? messageRepository.countByRoom(room)
                            : messageRepository.countByRoomAndCreatedAtAfter(room, floor);
                })
                .orElse(0L);

        return new RoomSummaryResponse(
                room.getId(), room.getType(), room.getTitle(),
                memberDtos, lastMessage, lastMessageAt, unread);
    }

    private void ensureMember(ChatRoom room, User user) {
        if (!memberRepository.existsByRoomAndUser(room, user)) {
            throw new IllegalArgumentException("방 멤버가 아닙니다.");
        }
    }

    private ChatRoom getRoomEntity(UUID roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 방입니다."));
    }

    private User getUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
    }
}
