/** 메시지 시간 표시 (오전/오후 h:mm). 테마 공통. */
export function msgTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}
