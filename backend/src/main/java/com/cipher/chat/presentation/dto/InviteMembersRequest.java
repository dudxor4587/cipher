package com.cipher.chat.presentation.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import java.util.UUID;

public record InviteMembersRequest(
        @NotEmpty List<UUID> memberIds) {
}
