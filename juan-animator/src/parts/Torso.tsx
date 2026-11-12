import type { FC } from "react";

const Torso: FC = () => (
  <g id="torso">
    <path
      d="M148 275 L168 265 L200 280 L232 265 L252 275
         Q268 288 268 315 L258 395 Q200 410 142 395
         L132 315 Q132 288 148 275"
      fill="#39749F" stroke="#285778" strokeWidth="3"
    />
    <path d="M168 265 L200 290 L232 265 L220 300 L200 308 L180 300 Z"
          fill="#D4E2EA" stroke="#285778" strokeWidth="3" />
    <circle cx="200" cy="315" r="3" fill="#D4E2EA" />
    <circle cx="200" cy="330" r="3" fill="#D4E2EA" />
    <rect x="140" y="385" width="120" height="18" rx="3" fill="#68472F" />
    <rect x="192" y="385" width="16" height="18" rx="3" fill="#C6A66A" stroke="#4B3825" strokeWidth="2" />
  </g>
);

export default Torso;