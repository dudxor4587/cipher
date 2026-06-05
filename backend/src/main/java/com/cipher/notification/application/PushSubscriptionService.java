package com.cipher.notification.application;

import com.cipher.notification.application.handler.ExpiredPushSubscriptionHandler;
import com.cipher.notification.domain.repository.PushSubscriptionRepository;
import com.cipher.notification.presentation.dto.PushSubscriptionRequest;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PushSubscriptionService implements ExpiredPushSubscriptionHandler {

    private final PushSubscriptionRepository pushSubscriptionRepository;

    @Transactional
    public void save(UUID userId, PushSubscriptionRequest request) {
        pushSubscriptionRepository.upsert(
                UUID.randomUUID(), userId,
                request.endpoint(), request.keys().p256dh(), request.keys().auth());
    }

    @Override
    @Transactional
    public void cleanup(String endpoint) {
        pushSubscriptionRepository.deleteByEndpoint(endpoint);
    }
}
