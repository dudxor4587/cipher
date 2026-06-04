package com.cipher.chat.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.cipher.BaseTest;
import com.cipher.auth.application.AuthService;
import com.cipher.auth.application.dto.TokenResponse;
import com.cipher.auth.presentation.dto.SignupRequest;
import com.cipher.chat.application.dto.MessageResponse;
import com.cipher.chat.application.dto.RoomSummaryResponse;
import com.cipher.common.dto.CursorPage;
import com.cipher.chat.domain.RoomType;
import com.cipher.chat.presentation.dto.CreateRoomRequest;
import com.cipher.friend.application.FriendService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

@Transactional
class MessageServiceTest extends BaseTest {

    @Autowired
    AuthService authService;
    @Autowired
    FriendService friendService;
    @Autowired
    RoomService roomService;
    @Autowired
    MessageService messageService;

    private TokenResponse signup(String loginId, String name) {
        return authService.signup(new SignupRequest(loginId, "pass1234", name));
    }

    @Test
    void 전송_조회_미읽음_읽음처리_흐름() {
        TokenResponse alice = signup("alice", "앨리스");
        TokenResponse bob = signup("bob", "밥");
        friendService.addByHandle(alice.userId(), "밥#" + bob.tag());
        RoomSummaryResponse room = roomService.createRoom(alice.userId(),
                new CreateRoomRequest(RoomType.DIRECT, null, List.of(bob.userId())));

        // 밥이 메시지 전송 (본문은 암호화 저장되지만 조회 시 복호화)
        messageService.send(bob.userId(), room.id(), "안녕 앨리스");

        // 앨리스 입장: 미읽음 1, 마지막 메시지 노출
        RoomSummaryResponse forAlice = myRoom(alice, room);
        assertThat(forAlice.unreadCount()).isEqualTo(1);
        assertThat(forAlice.lastMessage()).isEqualTo("안녕 앨리스");

        // 히스토리 복호화 확인
        List<MessageResponse> history = messageService.history(alice.userId(), room.id(), null, 30).content();
        assertThat(history).extracting(MessageResponse::content).containsExactly("안녕 앨리스");

        // 읽음 처리 후 미읽음 0
        messageService.markRead(alice.userId(), room.id(), history.get(history.size() - 1).id());
        assertThat(myRoom(alice, room).unreadCount()).isZero();
    }

    @Test
    void 나간_1대1은_상대가_보내면_재등장하고_이전기록은_안보인다() {
        TokenResponse alice = signup("alice", "앨리스");
        TokenResponse bob = signup("bob", "밥");
        friendService.addByHandle(alice.userId(), "밥#" + bob.tag());
        RoomSummaryResponse room = roomService.createRoom(alice.userId(),
                new CreateRoomRequest(RoomType.DIRECT, null, List.of(bob.userId())));

        messageService.send(alice.userId(), room.id(), "예전 대화");
        roomService.leave(bob.userId(), room.id());
        assertThat(roomService.getMyRooms(bob.userId()))
                .extracting(RoomSummaryResponse::id).doesNotContain(room.id());

        // 앨리스가 다시 보내면 밥에게 방이 재등장
        messageService.send(alice.userId(), room.id(), "다시 왔어?");
        assertThat(roomService.getMyRooms(bob.userId()))
                .extracting(RoomSummaryResponse::id).contains(room.id());

        // 밥은 나간 이후 메시지만 보임(이전 "예전 대화"는 숨김)
        assertThat(messageService.history(bob.userId(), room.id(), null, 30).content())
                .extracting(MessageResponse::content).containsExactly("다시 왔어?");
        // 앨리스(안 나간 사람)는 전체 그대로
        assertThat(messageService.history(alice.userId(), room.id(), null, 30).content())
                .extracting(MessageResponse::content).containsExactly("예전 대화", "다시 왔어?");
    }

    @Test
    void 히스토리는_커서로_과거를_끊어_받는다() {
        TokenResponse alice = signup("alice", "앨리스");
        TokenResponse bob = signup("bob", "밥");
        friendService.addByHandle(alice.userId(), "밥#" + bob.tag());
        RoomSummaryResponse room = roomService.createRoom(alice.userId(),
                new CreateRoomRequest(RoomType.DIRECT, null, List.of(bob.userId())));

        for (int i = 1; i <= 5; i++) {
            messageService.send(alice.userId(), room.id(), "m" + i);
        }

        // 최신 2개 (오래된순 정렬) + 더 있음
        CursorPage<MessageResponse> first = messageService.history(alice.userId(), room.id(), null, 2);
        assertThat(first.content()).extracting(MessageResponse::content).containsExactly("m4", "m5");
        assertThat(first.hasNext()).isTrue();
        assertThat(first.nextCursor()).isEqualTo(first.content().get(0).id()); // 이번 페이지 가장 오래된 것

        // 커서로 더 과거 2개
        CursorPage<MessageResponse> second = messageService.history(alice.userId(), room.id(), first.nextCursor(), 2);
        assertThat(second.content()).extracting(MessageResponse::content).containsExactly("m2", "m3");
        assertThat(second.hasNext()).isTrue();

        // 마지막 페이지 — 더 없음
        CursorPage<MessageResponse> third = messageService.history(alice.userId(), room.id(), second.nextCursor(), 2);
        assertThat(third.content()).extracting(MessageResponse::content).containsExactly("m1");
        assertThat(third.hasNext()).isFalse();
    }

    private RoomSummaryResponse myRoom(TokenResponse user, RoomSummaryResponse room) {
        return roomService.getMyRooms(user.userId()).stream()
                .filter(r -> r.id().equals(room.id())).findFirst().orElseThrow();
    }
}
