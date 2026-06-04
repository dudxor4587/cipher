package com.cipher.chat.presentation;
import com.cipher.chat.application.MessageService;

import com.cipher.chat.application.dto.MessageResponse;
import com.cipher.common.dto.CursorPage;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rooms/{roomId}/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping
    public ResponseEntity<CursorPage<MessageResponse>> history(@AuthenticationPrincipal UUID userId,
                                                              @PathVariable UUID roomId,
                                                              @RequestParam(required = false) UUID beforeId,
                                                              @RequestParam(defaultValue = "30") int size) {
        return ResponseEntity.ok(messageService.history(userId, roomId, beforeId, size));
    }

    @PostMapping("/read")
    public ResponseEntity<Void> markRead(@AuthenticationPrincipal UUID userId,
                                         @PathVariable UUID roomId,
                                         @RequestParam UUID lastReadMessageId) {
        messageService.markRead(userId, roomId, lastReadMessageId);
        return ResponseEntity.ok().build();
    }
}
