import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useApp } from '../core/store';
import type { ChatMessage } from '../core/types';

interface Props {
  messages: ChatMessage[];
  activeRoomId: string | null;
  /** 스크롤 컨테이너 클래스 (테마별: message-scroll / cli-out) */
  className?: string;
  /** 메시지 사이 간격(px) — 가상화는 flex gap 을 못 쓰므로 행 하단 패딩으로 처리 */
  gap?: number;
  /** 초기 행 높이 추정치 (측정 전 임시값) */
  estimate?: number;
  /** 중앙 정렬 최대폭 (Base 테마=768, CLI=풀폭이면 미지정) */
  maxWidth?: number;
  renderItem: (msg: ChatMessage) => ReactNode;
}

/**
 * 가상 스크롤 메시지 리스트.
 * - 화면에 보이는 행만 DOM 에 렌더 → 누적 메시지가 많아도 DOM 노드 수 상한이 잡힘.
 * - 가변 높이는 measureElement(ResizeObserver) 로 실제 측정.
 * - 위로 스크롤하면 store.loadOlder 로 더 과거를 받아 prepend, 스크롤 위치 보정.
 * - 새 메시지/방 변경 시 하단으로 고정.
 */
export function VirtualMessageList({
  messages,
  activeRoomId,
  className,
  gap = 8,
  estimate = 56,
  maxWidth,
  renderItem,
}: Props) {
  const parentRef = useRef<HTMLDivElement>(null);
  const loadOlder = useApp((s) => s.loadOlder);
  const hasMore = useApp((s) => (activeRoomId ? (s.hasMoreByRoom[activeRoomId] ?? false) : false));
  const loadingRef = useRef(false);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimate,
    overscan: 10,
    getItemKey: (index) => messages[index].id,
  });

  const lastId = messages[messages.length - 1]?.id;

  // 새 메시지 도착/방 변경 시 하단으로. 측정이 늦게 끝날 수 있어 한 번 더 보정.
  useEffect(() => {
    if (!messages.length) return;
    virtualizer.scrollToIndex(messages.length - 1, { align: 'end' });
    const id = requestAnimationFrame(() =>
      virtualizer.scrollToIndex(messages.length - 1, { align: 'end' }),
    );
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastId, activeRoomId]);

  const onScroll = () => {
    const el = parentRef.current;
    if (!el) return;
    if (el.scrollTop < 80 && hasMore && !loadingRef.current && activeRoomId) {
      loadingRef.current = true;
      const prevHeight = el.scrollHeight;
      const prevTop = el.scrollTop;
      void loadOlder(activeRoomId).finally(() => {
        // 위에 붙은 높이만큼 보정 → 보던 위치 유지
        requestAnimationFrame(() => {
          el.scrollTop = el.scrollHeight - prevHeight + prevTop;
          loadingRef.current = false;
        });
      });
    }
  };

  const items = virtualizer.getVirtualItems();

  return (
    <div ref={parentRef} className={className} onScroll={onScroll}>
      <div
        style={{
          height: virtualizer.getTotalSize(),
          width: '100%',
          maxWidth,
          margin: maxWidth ? '0 auto' : undefined,
          position: 'relative',
        }}
      >
        {items.map((vi) => (
          <div
            key={vi.key}
            className="vrow"
            data-index={vi.index}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${vi.start}px)`,
              paddingBottom: gap,
            }}
          >
            {renderItem(messages[vi.index])}
          </div>
        ))}
      </div>
    </div>
  );
}
