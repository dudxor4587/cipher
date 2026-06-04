package com.cipher.chat.presentation.dto;

import com.cipher.chat.domain.RoomType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public record CreateRoomRequest(
        @NotNull RoomType type,
        String title,
        @NotEmpty List<UUID> memberIds) {
}
