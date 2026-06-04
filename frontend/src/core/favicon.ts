// 테마별 파비콘(브랜드 위장). 탭 제목과 함께 바뀌어 진짜 그 AI 도구처럼 보이게 한다.
const SVGS: Record<string, string> = {
  // Claude — 코랄 선버스트(별표)
  claude:
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><g stroke='#d97757' stroke-width='2.4' stroke-linecap='round'><line x1='12' y1='2.5' x2='12' y2='21.5'/><line x1='2.5' y1='12' x2='21.5' y2='12'/><line x1='5.2' y1='5.2' x2='18.8' y2='18.8'/><line x1='18.8' y1='5.2' x2='5.2' y2='18.8'/></g></svg>",
  // ChatGPT — 검정 라운드 사각 + 흰 매듭
  gpt:
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect width='24' height='24' rx='6' fill='#000'/><path d='M12 3.2c1.8 0 3.4 1 4.2 2.5 1.7.1 3.2 1.2 3.9 2.8.7 1.6.4 3.4-.6 4.7.5 1.6.1 3.4-1.1 4.6-1.2 1.2-3 1.6-4.6 1.1-1 1-2.4 1.5-3.8 1.3-1.8-.2-3.3-1.3-4-2.9-1.6-.2-3-1.3-3.6-2.8-.6-1.6-.3-3.3.8-4.6-.5-1.6 0-3.4 1.2-4.5C5.6 4 7.2 3.6 8.8 4c.8-.5 1.9-.8 3.2-.8Z' fill='none' stroke='#fff' stroke-width='1.4' stroke-linejoin='round'/></svg>",
  // Gemini — 블루→퍼플 그라데이션 4점 스파클
  gemini:
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><defs><linearGradient id='g' x1='0' y1='0' x2='24' y2='24' gradientUnits='userSpaceOnUse'><stop offset='0' stop-color='#4287f5'/><stop offset='.5' stop-color='#9168e6'/><stop offset='1' stop-color='#d96570'/></linearGradient></defs><path d='M12 2c.7 5.4 3.6 8.3 9 9-5.4.7-8.3 3.6-9 9-.7-5.4-3.6-8.3-9-9 5.4-.7 8.3-3.6 9-9Z' fill='url(#g)'/></svg>",
  // CLI — 검정 터미널 + 초록 >_
  cli:
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect width='24' height='24' rx='6' fill='#000'/><path d='M5 8l4 4-4 4' fill='none' stroke='#3fb950' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/><line x1='12' y1='16.5' x2='18' y2='16.5' stroke='#3fb950' stroke-width='2' stroke-linecap='round'/></svg>",
};

export function setFavicon(themeKey: string) {
  const svg = SVGS[themeKey] ?? SVGS.claude;
  const href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.type = 'image/svg+xml';
  link.href = href;
}
