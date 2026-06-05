package com.cipher.infra.external.notification.adapter;

import com.cipher.infra.external.notification.WebPushClient;
import com.cipher.notification.application.dto.WebPushCommand;
import com.cipher.notification.application.port.WebPushPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WebPushAdapter implements WebPushPort {

    private final WebPushClient webPushClient;

    @Override
    public void sendPush(WebPushCommand command) {
        webPushClient.sendPushNotification(
                command.endpoint(), command.p256dh(), command.auth(), command.title());
    }
}
