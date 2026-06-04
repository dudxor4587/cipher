/** 회사 로고를 근사한 브랜드 아이콘들. 정확한 트레이드마크가 아닌 식별용 근사. */

export function ClaudeIcon({ size = 20 }: { size?: number }) {
  // 코랄 색 선버스트(별표) 근사
  const spokes = Array.from({ length: 12 }, (_, i) => (i * 360) / 12);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <g stroke="#d97757" strokeWidth="2.1" strokeLinecap="round">
        {spokes.map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const len = deg % 60 === 0 ? 9 : 6.2;
          return (
            <line
              key={deg}
              x1={12}
              y1={12}
              x2={12 + len * Math.cos(rad)}
              y2={12 + len * Math.sin(rad)}
            />
          );
        })}
      </g>
    </svg>
  );
}

export function GptIcon({ size = 20 }: { size?: number }) {
  // OpenAI 매듭을 단순화한 육각 꽃 근사 (currentColor 로 라이트/다크 적응)
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden fill="none">
      <path
        d="M12 3.2c1.8 0 3.4 1 4.2 2.5 1.7.1 3.2 1.2 3.9 2.8.7 1.6.4 3.4-.6 4.7.5 1.6.1 3.4-1.1 4.6-1.2 1.2-3 1.6-4.6 1.1-1 1-2.4 1.5-3.8 1.3-1.8-.2-3.3-1.3-4-2.9-1.6-.2-3-1.3-3.6-2.8-.6-1.6-.3-3.3.8-4.6-.5-1.6 0-3.4 1.2-4.5C5.6 4 7.2 3.6 8.8 4c.8-.5 1.9-.8 3.2-.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.3" fill="currentColor" />
    </svg>
  );
}

export function GeminiIcon({ size = 20 }: { size?: number }) {
  // 4점 스파클 + 블루→퍼플 그라데이션
  const id = `gem-grad-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4287f5" />
          <stop offset="0.5" stopColor="#9168e6" />
          <stop offset="1" stopColor="#d96570" />
        </linearGradient>
      </defs>
      <path
        d="M12 2c.7 5.4 3.6 8.3 9 9-5.4.7-8.3 3.6-9 9-.7-5.4-3.6-8.3-9-9 5.4-.7 8.3-3.6 9-9Z"
        fill={`url(#${id})`}
      />
    </svg>
  );
}
