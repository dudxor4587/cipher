package com.cipher.notification.presentation;

import com.cipher.notification.application.PushSubscriptionService;
import com.cipher.notification.presentation.dto.PushSubscriptionRequest;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/push-subscriptions")
@RequiredArgsConstructor
public class PushSubscriptionController {

    private final PushSubscriptionService pushSubscriptionService;

    @Value("${vapid.public.key}")
    private String vapidPublicKey;

    @GetMapping("/key")
    public ResponseEntity<Map<String, String>> publicKey() {
        return ResponseEntity.ok(Map.of("publicKey", vapidPublicKey));
    }

    @PostMapping
    public ResponseEntity<Void> subscribe(@AuthenticationPrincipal UUID userId,
                                          @RequestBody PushSubscriptionRequest request) {
        pushSubscriptionService.save(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping
    public ResponseEntity<Void> unsubscribe(@RequestBody UnsubscribeRequest request) {
        pushSubscriptionService.cleanup(request.endpoint());
        return ResponseEntity.noContent().build();
    }

    public record UnsubscribeRequest(String endpoint) {
    }
}
