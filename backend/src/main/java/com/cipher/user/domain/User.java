package com.cipher.user.domain;

import com.cipher.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"displayName", "tag"})
})
@Getter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String loginId;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String displayName;

    /** 디스코드식 식별 태그 (예: "0042"). displayName 과 조합해 핸들(이름#태그)을 이룬다. */
    @Column(nullable = false, length = 4)
    private String tag;

    /** 화면 표시용 핸들: 앨리스#0042 */
    public String handle() {
        return displayName + "#" + tag;
    }

    /** 비밀번호 일치 여부(판단만). 예외 처리는 호출 측에서. */
    public boolean matchesPassword(String rawPassword, PasswordEncoder passwordEncoder) {
        return passwordEncoder.matches(rawPassword, this.password);
    }

    public void changeProfile(String displayName) {
        if (displayName != null && !displayName.isBlank()) {
            this.displayName = displayName;
        }
    }

    public void assignTag(String tag) {
        this.tag = tag;
    }
}
