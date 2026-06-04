package com.cipher.friend.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.cipher.BaseTest;
import com.cipher.auth.application.AuthService;
import com.cipher.auth.application.dto.TokenResponse;
import com.cipher.auth.presentation.dto.SignupRequest;
import com.cipher.user.application.dto.UserSummary;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

@Transactional
class FriendServiceTest extends BaseTest {

    @Autowired
    AuthService authService;
    @Autowired
    FriendService friendService;

    private TokenResponse signup(String loginId, String name) {
        return authService.signup(new SignupRequest(loginId, "pass1234", name));
    }

    @Test
    void 핸들로_추가하면_양방향_친구가_된다() {
        TokenResponse alice = signup("alice", "앨리스");
        TokenResponse bob = signup("bob", "밥");

        friendService.addByHandle(alice.userId(), "밥#" + bob.tag());

        assertThat(friendService.listFriends(alice.userId()))
                .extracting(UserSummary::userId).containsExactly(bob.userId());
        assertThat(friendService.listFriends(bob.userId()))
                .extracting(UserSummary::userId).containsExactly(alice.userId());
    }

    @Test
    void 자기자신은_추가할_수_없다() {
        TokenResponse alice = signup("alice", "앨리스");
        assertThatThrownBy(() -> friendService.addByHandle(alice.userId(), "앨리스#" + alice.tag()))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void 존재하지_않는_핸들은_실패() {
        TokenResponse alice = signup("alice", "앨리스");
        assertThatThrownBy(() -> friendService.addByHandle(alice.userId(), "없는사람#9999"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void 형식이_틀리면_실패() {
        TokenResponse alice = signup("alice", "앨리스");
        assertThatThrownBy(() -> friendService.addByHandle(alice.userId(), "태그없음"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void 같은_방이_아니면_userId로_추가_불가() {
        TokenResponse alice = signup("alice", "앨리스");
        TokenResponse bob = signup("bob", "밥");
        assertThatThrownBy(() -> friendService.addByUserId(alice.userId(), bob.userId()))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
