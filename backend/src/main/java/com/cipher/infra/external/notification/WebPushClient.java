package com.cipher.infra.external.notification;

import com.cipher.notification.application.handler.ExpiredPushSubscriptionHandler;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;
import org.apache.http.HttpResponse;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebPushClient {

    private static final int PUSH_TIMEOUT_SECONDS = 10;
    private static final int HTTP_NOT_FOUND = 404;
    private static final int HTTP_GONE = 410;

    private final PushService pushService;
    private final ExpiredPushSubscriptionHandler expiredPushSubscriptionHandler;

    @Async("pushTaskExecutor")
    public void sendPushNotification(String endpoint, String p256dh, String auth, String title) {
        try {
            Subscription subscription = new Subscription(endpoint, new Subscription.Keys(p256dh, auth));
            Notification notification = new Notification(subscription, buildPayload(title));

            HttpResponse response = pushService.sendAsync(notification)
                    .get(PUSH_TIMEOUT_SECONDS, TimeUnit.SECONDS);

            handleResponse(response.getStatusLine().getStatusCode(), endpoint);
        } catch (Exception e) {
            log.error("푸시 발송 실패: endpoint={}", endpoint, e);
        }
    }

    private void handleResponse(int statusCode, String endpoint) {
        if (statusCode == HTTP_NOT_FOUND || statusCode == HTTP_GONE) {
            log.info("만료된 푸시 구독 삭제: endpoint={}, status={}", endpoint, statusCode);
            expiredPushSubscriptionHandler.cleanup(endpoint);
        } else if (statusCode >= 400) {
            log.warn("푸시 발송 응답 오류: endpoint={}, status={}", endpoint, statusCode);
        }
    }

    private String buildPayload(String title) {
        String t = title == null ? "" : title.replace("\\", "\\\\").replace("\"", "\\\"");
        return String.format("{\"title\":\"%s\",\"body\":\"%s\"}", t, t);
    }
}
