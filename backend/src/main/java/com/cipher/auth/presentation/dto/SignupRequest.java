package com.cipher.auth.presentation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignupRequest(
        @NotBlank @Size(min = 3, max = 30) String loginId,
        @NotBlank @Size(min = 4, max = 100) String password,
        @NotBlank @Size(max = 30) String displayName) {
}
