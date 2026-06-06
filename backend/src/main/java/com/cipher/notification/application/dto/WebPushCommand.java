package com.cipher.notification.application.dto;

public record WebPushCommand(
        String endpoint,
        String p256dh,
        String auth,
        String title,
        String roomId) {
}
