package com.cipher.notification.application.handler;

public interface ExpiredPushSubscriptionHandler {

    void cleanup(String endpoint);
}
