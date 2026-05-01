interface LogoProps {
  size?: number;
  className?: string;
  /** Show the wordmark beside the icon */
  showWordmark?: boolean;
}

export function CampusCompassLogo({ size = 40, className = "", showWordmark = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 200"
        fill="none"
        width={size}
        height={size}
        aria-label="Campus Compass logo"
      >
        <defs>
          <linearGradient id="cc-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#312e81" />
          </linearGradient>
          <linearGradient id="cc-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="cc-north" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0abfc" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          <linearGradient id="cc-south" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e0e7ff" />
            <stop offset="100%" stopColor="#c7d2fe" />
          </linearGradient>
          <filter id="cc-glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <circle cx="100" cy="100" r="96" fill="url(#cc-bg)" />
        <circle cx="100" cy="100" r="88" stroke="#6366f1" strokeWidth="1.5" strokeOpacity="0.3" fill="none" />
        <circle cx="100" cy="100" r="64" fill="none" stroke="url(#cc-ring)" strokeWidth="1.5" strokeOpacity="0.5" />

        {/* Cardinal ticks */}
        <g stroke="#818cf8" strokeWidth="1.2" strokeOpacity="0.6">
          <line x1="100" y1="38" x2="100" y2="46" />
          <line x1="100" y1="154" x2="100" y2="162" />
          <line x1="38" y1="100" x2="46" y2="100" />
          <line x1="154" y1="100" x2="162" y2="100" />
          <line x1="145.3" y1="54.7" x2="140.0" y2="60.0" />
          <line x1="54.7" y1="145.3" x2="60.0" y2="140.0" />
          <line x1="54.7" y1="54.7" x2="60.0" y2="60.0" />
          <line x1="145.3" y1="145.3" x2="140.0" y2="140.0" />
        </g>

        {/* Cardinal letters */}
        <g fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="11" fontWeight="700" textAnchor="middle" dominantBaseline="central">
          <text x="100" y="30" fill="#c084fc" filter="url(#cc-glow)">N</text>
          <text x="100" y="172" fill="#a5b4fc">S</text>
          <text x="28" y="101" fill="#a5b4fc">W</text>
          <text x="172" y="101" fill="#a5b4fc">E</text>
        </g>

        {/* Needle north */}
        <polygon points="100,48 105,100 100,96 95,100" fill="url(#cc-north)" filter="url(#cc-glow)" transform="rotate(-35 100 100)" />
        {/* Needle south */}
        <polygon points="100,152 105,100 100,104 95,100" fill="url(#cc-south)" opacity="0.75" transform="rotate(-35 100 100)" />

        {/* Center */}
        <circle cx="100" cy="100" r="7" fill="#312e81" stroke="#818cf8" strokeWidth="2" />
        <circle cx="100" cy="100" r="3.5" fill="#c084fc" filter="url(#cc-glow)" />

        {/* Mortarboard */}
        <g transform="translate(100, 66)" filter="url(#cc-glow)">
          <polygon points="0,-9 16,0 0,9 -16,0" fill="#f0abfc" opacity="0.95" />
          <rect x="-5" y="-13" width="10" height="5" rx="1" fill="#c084fc" />
          <line x1="16" y1="0" x2="16" y2="9" stroke="#f0abfc" strokeWidth="1.5" />
          <circle cx="16" cy="10" r="1.5" fill="#f0abfc" />
        </g>
      </svg>

      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span className="text-lg font-bold tracking-tight text-white">Campus</span>
          <span className="text-lg font-bold tracking-tight text-indigo-400">Compass</span>
        </div>
      )}
    </div>
  );
}
