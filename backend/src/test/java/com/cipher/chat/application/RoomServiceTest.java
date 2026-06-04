package com.cipher.chat.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.cipher.BaseTest;
import com.cipher.auth.application.AuthService;
import com.cipher.auth.application.dto.TokenResponse;
import com.cipher.auth.presentation.dto.SignupRequest;
import com.cipher.chat.application.dto.RoomMemberView;
import com.cipher.chat.application.dto.RoomSummaryResponse;
import com.cipher.chat.domain.RoomType;
import com.cipher.chat.presentation.dto.CreateRoomRequest;
import com.cipher.friend.application.FriendService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

@Transactional
class RoomServiceTest extends BaseTest {

    @Autowired
    AuthService authService;
    @Autowired
    FriendService friendService;
    @Autowired
    RoomService roomService;

    private TokenResponse signup(String loginId, String name) {
        return authService.signup(new SignupRequest(loginId, "pass1234", name));
    }

    private void makeFriends(TokenResponse a, TokenResponse b) {
        friendService.addByHandle(a.userId(), b.displayName() + "#" + b.tag());
    }

    @Test
    void 비친구와는_1대1_방을_만들_수_없다() {
        TokenResponse alice = signup("alice", "앨리스");
        TokenResponse bob = signup("bob", "밥");

        assertThatThrownBy(() -> roomService.createRoom(alice.userId(),
                new CreateRoomRequest(RoomType.DIRECT, null, List.of(bob.userId()))))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void 친구면_1대1_생성되고_재호출시_같은_방을_반환() {
        TokenResponse alice = signup("alice", "앨리스");
        TokenResponse bob = signup("bob", "밥");
        makeFriends(alice, bob);

        RoomSummaryResponse r1 = roomService.createRoom(alice.userId(),
                new CreateRoomRequest(RoomType.DIRECT, null, List.of(bob.userId())));
        RoomSummaryResponse r2 = roomService.createRoom(alice.userId(),
                new CreateRoomRequest(RoomType.DIRECT, null, List.of(bob.userId())));

        assertThat(r2.id()).isEqualTo(r1.id()); // 중복 생성 방지
    }

    @Test
    void 나간_1대1_방을_다시_생성하면_재합류되어_목록에_다시_뜬다() {
        TokenResponse alice = signup("alice", "앨리스");
        TokenResponse bob = signup("bob", "밥");
        makeFriends(alice, bob);

        RoomSummaryResponse room = roomService.createRoom(alice.userId(),
                new CreateRoomRequest(RoomType.DIRECT, null, List.of(bob.userId())));
        roomService.leave(alice.userId(), room.id());

        // 나간 직후엔 내 목록에서 빠져 있어야 한다
        assertThat(roomService.getMyRooms(alice.userId()))
                .noneMatch(r -> r.id().equals(room.id()));

        // 같은 상대와 다시 시작 → 같은 방으로 dedup 되고, 나를 재합류시켜 목록에 다시 떠야 한다
        RoomSummaryResponse again = roomService.createRoom(alice.userId(),
                new CreateRoomRequest(RoomType.DIRECT, null, List.of(bob.userId())));

        assertThat(again.id()).isEqualTo(room.id());
        assertThat(roomService.getMyRooms(alice.userId()))
                .anyMatch(r -> r.id().equals(room.id()));
    }

    @Test
    void 그룹은_친구만_초대_가능하고_비친구_멤버는_태그가_가려진다() {
        TokenResponse alice = signup("alice", "앨리스");
        TokenResponse bob = signup("bob", "밥");
        TokenResponse carol = signup("carol", "캐롤");
        makeFriends(alice, bob);
        makeFriends(alice, carol); // 밥↔캐롤은 친구 아님

        RoomSummaryResponse group = roomService.createRoom(alice.userId(),
                new CreateRoomRequest(RoomType.GROUP, "3팀", List.of(bob.userId(), carol.userId())));
        assertThat(group.type()).isEqualTo(RoomType.GROUP);
        assertThat(group.members()).hasSize(3);

        // 캐롤 시점: 밥은 친구 아님 → tag 가려짐, 앨리스는 친구 → tag 노출
        RoomSummaryResponse carolView = roomService.getRoom(carol.userId(), group.id());
        RoomMemberView bobView = carolView.members().stream()
                .filter(m -> m.userId().equals(bob.userId())).findFirst().orElseThrow();
        RoomMemberView aliceView = carolView.members().stream()
                .filter(m -> m.userId().equals(alice.userId())).findFirst().orElseThrow();

        assertThat(bobView.friend()).isFalse();
        assertThat(bobView.tag()).isNull();
        assertThat(aliceView.friend()).isTrue();
        assertThat(aliceView.tag()).isNotNull();
    }

    @Test
    void 친구가_아닌_사람은_그룹에_초대할_수_없다() {
        TokenResponse alice = signup("alice", "앨리스");
        TokenResponse bob = signup("bob", "밥");
        TokenResponse stranger = signup("stranger", "낯선이");
        makeFriends(alice, bob);

        RoomSummaryResponse group = roomService.createRoom(alice.userId(),
                new CreateRoomRequest(RoomType.GROUP, "방", List.of(bob.userId())));

        assertThatThrownBy(() -> roomService.invite(alice.userId(), group.id(),
                List.of(stranger.userId()))).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void 나가면_본인_목록서_빠지고_상대는_그대로_유지된다() {
        TokenResponse alice = signup("alice", "앨리스");
        TokenResponse bob = signup("bob", "밥");
        makeFriends(alice, bob);
        RoomSummaryResponse room = roomService.createRoom(alice.userId(),
                new CreateRoomRequest(RoomType.DIRECT, null, List.of(bob.userId())));

        roomService.leave(bob.userId(), room.id());

        // 나간 bob 목록엔 없음
        assertThat(roomService.getMyRooms(bob.userId()))
                .extracting(RoomSummaryResponse::id).doesNotContain(room.id());
        // 남은 alice 목록엔 그대로, 상대(bob) 이름도 계속 보임(멤버에 포함)
        assertThat(roomService.getMyRooms(alice.userId()))
                .extracting(RoomSummaryResponse::id).contains(room.id());
        assertThat(roomService.getRoom(alice.userId(), room.id()).members())
                .extracting(RoomMemberView::userId).contains(bob.userId());
    }

    @Test
    void 둘_다_나가면_방이_삭제된다() {
        TokenResponse alice = signup("alice", "앨리스");
        TokenResponse bob = signup("bob", "밥");
        makeFriends(alice, bob);
        RoomSummaryResponse room = roomService.createRoom(alice.userId(),
                new CreateRoomRequest(RoomType.DIRECT, null, List.of(bob.userId())));

        roomService.leave(alice.userId(), room.id());
        roomService.leave(bob.userId(), room.id());

        assertThatThrownBy(() -> roomService.getRoom(alice.userId(), room.id()))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
