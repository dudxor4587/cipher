package com.cipher.user.presentation.dto;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(max = 30) String displayName) {
}
