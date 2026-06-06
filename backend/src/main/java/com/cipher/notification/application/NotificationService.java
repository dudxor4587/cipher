package com.cipher.notification.application;

import com.cipher.chat.application.NewMessageEvent;
import com.cipher.notification.application.dto.WebPushCommand;
import com.cipher.notification.application.port.WebPushPort;
import com.cipher.notification.domain.PushSubscription;
import com.cipher.notification.domain.repository.PushSubscriptionRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final String HIDDEN_TITLE = "새 메시지";

    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final WebPushPort webPushPort;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onNewMessage(NewMessageEvent event) {
        String roomId = event.roomId().toString();
        for (UUID userId : event.recipientUserIds()) {
            for (PushSubscription sub : pushSubscriptionRepository.findAllByUserId(userId)) {
                webPushPort.sendPush(new WebPushCommand(
                        sub.getEndpoint(), sub.getP256dh(), sub.getAuth(), HIDDEN_TITLE, roomId));
            }
        }
    }
}
