package com.cipher.common.dto;

import java.util.List;
import java.util.UUID;

public record CursorPage<T>(List<T> content, boolean hasNext, UUID nextCursor) {
}
