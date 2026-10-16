/** Decorative learning illustration adapted from the login design reference. */
export function LoginIllustration() {
  return (
    <svg
      className="login-illustration"
      viewBox="0 0 540 460"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="loginBulb" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <filter id="loginShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0369a1" floodOpacity="0.12" />
        </filter>
      </defs>
      <ellipse cx="270" cy="430" rx="230" ry="8" fill="#E2E8F0" />
      <ellipse cx="270" cy="430" rx="190" ry="4" fill="#CBD5E1" />

      <path d="M90 280l6 6m0-6l-6 6" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M445 180l6 6m0-6l-6 6" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
      <polygon points="175,160 182,172 168,172" stroke="#F97316" strokeWidth="2" />
      <circle cx="455" cy="225" r="3.5" fill="#F43F5E" />
      <circle cx="160" cy="205" r="3" fill="#38BDF8" />

      <g filter="url(#loginShadow)">
        <rect x="180" y="70" width="180" height="340" rx="26" fill="#0284C7" />
        <rect x="186" y="76" width="168" height="328" rx="22" fill="#FFFFFF" />
        <circle cx="240" cy="90" r="3" fill="#94A3B8" />
        <rect x="252" y="88.5" width="22" height="3" rx="1.5" fill="#CBD5E1" />
        <circle cx="212" cy="120" r="14" fill="#E2E8F0" />
        <circle cx="212" cy="116" r="5" fill="#94A3B8" />
        <path d="M204 128c0-6 16-6 16 0" fill="#94A3B8" />
        <circle cx="212" cy="155" r="7" stroke="#38BDF8" strokeWidth="2" />
        <path d="M209 155l2 2 4-4" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="226" y="152.5" width="90" height="5" rx="2.5" fill="#E2E8F0" />
        <circle cx="212" cy="180" r="7" stroke="#38BDF8" strokeWidth="2" />
        <path d="M209 180l2 2 4-4" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="226" y="177.5" width="70" height="5" rx="2.5" fill="#E2E8F0" />
        <circle cx="212" cy="205" r="7" stroke="#CBD5E1" strokeWidth="2" />
        <rect x="226" y="202.5" width="85" height="5" rx="2.5" fill="#E2E8F0" />
        <rect x="205" y="228" width="110" height="4" rx="2" fill="#F1F5F9" />
        <rect x="205" y="240" width="80" height="4" rx="2" fill="#F1F5F9" />
      </g>

      <g transform="translate(150 180)">
        <ellipse cx="20" cy="30" rx="36" ry="40" fill="url(#loginBulb)" opacity="0.95" />
        <path d="M-2 55h44l-8 17H6z" fill="#E2E8F0" />
        <rect x="10" y="72" width="20" height="5" rx="2.5" fill="#94A3B8" />
        <path d="M12 38q8-16 16 0" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        <path d="M6 12L0 5M34 12l6-7M-20 30h-8" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      <g transform="translate(330 330)">
        <rect x="0" y="40" width="130" height="18" rx="3" fill="#FBBF24" />
        <rect x="-8" y="20" width="140" height="18" rx="3" fill="#F87171" />
        <rect x="0" y="0" width="130" height="18" rx="3" fill="#86EFAC" />
      </g>

      <g transform="translate(300 250)">
        <polygon points="0,20 50,0 100,20 50,40" fill="#0B3967" />
        <path d="M22 32v22c0 8 56 8 56 0V32" fill="#164E7F" />
      </g>

      <rect x="405" y="240" width="44" height="40" rx="6" fill="#0F766E" />
      <text x="427" y="268" textAnchor="middle" fontSize="22" fill="#FFFFFF">
        语
      </text>
      <rect x="165" y="130" width="38" height="38" rx="6" fill="#DC2626" />
      <text x="184" y="158" textAnchor="middle" fontSize="22" fill="#FFFFFF">
        学
      </text>
    </svg>
  );
}
