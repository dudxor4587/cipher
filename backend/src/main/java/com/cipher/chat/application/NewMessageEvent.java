package com.cipher.chat.application;

import java.util.List;
import java.util.UUID;

public record NewMessageEvent(List<UUID> recipientUserIds) {
}
