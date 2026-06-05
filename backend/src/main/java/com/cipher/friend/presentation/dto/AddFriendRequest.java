package com.cipher.friend.presentation.dto;

import jakarta.validation.constraints.NotBlank;

public record AddFriendRequest(
        @NotBlank String handle) {
}
