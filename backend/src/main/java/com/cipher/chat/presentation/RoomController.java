package com.cipher.chat.presentation;
import com.cipher.chat.application.RoomService;

import com.cipher.chat.presentation.dto.CreateRoomRequest;
import com.cipher.chat.presentation.dto.InviteMembersRequest;
import com.cipher.chat.presentation.dto.RenameRoomRequest;
import com.cipher.chat.application.dto.RoomSummaryResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @PostMapping
    public ResponseEntity<RoomSummaryResponse> create(@AuthenticationPrincipal UUID userId,
                                                      @Valid @RequestBody CreateRoomRequest request) {
        return ResponseEntity.ok(roomService.createRoom(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<RoomSummaryResponse>> myRooms(@AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(roomService.getMyRooms(userId));
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<RoomSummaryResponse> get(@AuthenticationPrincipal UUID userId,
                                                   @PathVariable UUID roomId) {
        return ResponseEntity.ok(roomService.getRoom(userId, roomId));
    }

    @PostMapping("/{roomId}/members")
    public ResponseEntity<RoomSummaryResponse> invite(@AuthenticationPrincipal UUID userId,
                                                      @PathVariable UUID roomId,
                                                      @Valid @RequestBody InviteMembersRequest request) {
        return ResponseEntity.ok(roomService.invite(userId, roomId, request.memberIds()));
    }

    @DeleteMapping("/{roomId}/members/me")
    public ResponseEntity<Void> leave(@AuthenticationPrincipal UUID userId,
                                      @PathVariable UUID roomId) {
        roomService.leave(userId, roomId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{roomId}")
    public ResponseEntity<RoomSummaryResponse> rename(@AuthenticationPrincipal UUID userId,
                                                      @PathVariable UUID roomId,
                                                      @RequestBody RenameRoomRequest request) {
        return ResponseEntity.ok(roomService.rename(userId, roomId, request.title()));
    }
}
