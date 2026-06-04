package com.cipher.friend.presentation.dto;

import jakarta.validation.constraints.NotBlank;

/** handle 예: "앨리스#0042" */
public record AddFriendRequest(
        @NotBlank String handle) {
}
