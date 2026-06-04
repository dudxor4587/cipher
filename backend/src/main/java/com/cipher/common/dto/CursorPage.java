package com.cipher.common.dto;

import java.util.List;
import java.util.UUID;

/**
 * 커서 기반 페이지 응답. UUID PK 라 offset/total-count 방식(Spring Page) 대신
 * createdAt 커서로 "더 과거 메시지"를 끊어 받는다.
 *
 * @param content    이번 페이지(표시용 오래된순)
 * @param hasNext    더 과거 메시지가 남아있는지
 * @param nextCursor 다음(더 과거) 조회에 쓸 커서 = 이번 페이지에서 가장 오래된 메시지 id
 */
public record CursorPage<T>(List<T> content, boolean hasNext, UUID nextCursor) {
}
