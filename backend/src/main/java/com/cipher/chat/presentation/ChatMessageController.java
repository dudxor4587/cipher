package com.cipher.chat.presentation;

import com.cipher.chat.application.MessageService;
import com.cipher.chat.application.dto.MessageResponse;
import com.cipher.chat.presentation.dto.SendMessageRequest;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

/**
 * 클라이언트가 /app/rooms/{roomId}/send 로 메시지를 보내면 저장 후
 * /topic/rooms/{roomId} 구독자 전체에게 fan-out 한다.
 */
@Controller
@RequiredArgsConstructor
public class ChatMessageController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/rooms/{roomId}/send")
    public void send(@DestinationVariable UUID roomId,
                     @Valid @Payload SendMessageRequest request,
                     Principal principal) {
        UUID senderId = UUID.fromString(principal.getName());
        MessageResponse saved = messageService.send(senderId, roomId, request.content());
        messagingTemplate.convertAndSend("/topic/rooms/" + roomId, saved);
    }
}
