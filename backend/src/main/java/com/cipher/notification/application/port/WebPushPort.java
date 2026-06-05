package com.cipher.notification.application.port;

import com.cipher.notification.application.dto.WebPushCommand;

public interface WebPushPort {

    void sendPush(WebPushCommand command);
}
