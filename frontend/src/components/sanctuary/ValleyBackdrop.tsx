import React from 'react';

const seeded = (index: number, salt = 1) => {
  const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return value - Math.floor(value);
};

const STARS = Array.from({ length: 110 }, (_, index) => ({
  x: seeded(index, 1) * 1440,
  y: seeded(index, 2) * 470,
  radius: 0.4 + seeded(index, 3) * 1.35,
  opacity: 0.28 + seeded(index, 4) * 0.65,
  delay: seeded(index, 5) * 6
}));

const FLOWERS = Array.from({ length: 86 }, (_, index) => ({
  x: seeded(index, 6) * 1440,
  y: 735 + seeded(index, 7) * 165,
  scale: 0.42 + seeded(index, 8) * 1.18,
  opacity: 0.4 + seeded(index, 9) * 0.58,
  kind: index % 5,
  delay: seeded(index, 10) * 7
}));

const LIGHTS = Array.from({ length: 28 }, (_, index) => ({
  x: 80 + seeded(index, 11) * 1280,
  y: 560 + seeded(index, 12) * 300,
  radius: 0.8 + seeded(index, 13) * 2.1,
  delay: seeded(index, 14) * 8,
  warm: index % 3 === 0
}));

/**
 * Original layered valley artwork built from organic SVG paths, atmospheric
 * gradients, botanical silhouettes, and restrained CSS motion. It is a
 * deliberately illustrated environment, not a photographic asset.
 */
export const ValleyBackdrop: React.FC = () => (
  <div className="valley-backdrop" aria-hidden="true">
    <svg
      className="valley-svg"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#171030" />
          <stop offset="26%" stopColor="#2c1a4e" />
          <stop offset="50%" stopColor="#4f3179" />
          <stop offset="70%" stopColor="#7d5088" />
          <stop offset="85%" stopColor="#c78d99" />
          <stop offset="94%" stopColor="#e3a8a4" />
          <stop offset="100%" stopColor="#f6d3bd" />
        </linearGradient>
        <linearGradient id="farMountain" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6d5391" stopOpacity="0.78" />
          <stop offset="100%" stopColor="#3f2c5c" stopOpacity="0.92" />
        </linearGradient>
        <linearGradient id="midMountain" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a2950" />
          <stop offset="100%" stopColor="#221733" />
        </linearGradient>
        <linearGradient id="nearMountain" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1129" />
          <stop offset="100%" stopColor="#100a1b" />
        </linearGradient>
        <linearGradient id="valleyFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5b3d6c" />
          <stop offset="45%" stopColor="#3d2a52" />
          <stop offset="100%" stopColor="#21162f" />
        </linearGradient>
        <linearGradient id="riverGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b8f6ff" stopOpacity="0.1" />
          <stop offset="38%" stopColor="#7ce9ff" stopOpacity="0.85" />
          <stop offset="72%" stopColor="#c4a6ff" stopOpacity="0.72" />
          <stop offset="100%" stopColor="#fff3fb" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="petalGradient" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#9b72d8" />
          <stop offset="55%" stopColor="#d9b6ff" />
          <stop offset="100%" stopColor="#fff6ff" />
        </linearGradient>
        <linearGradient id="petalWarm" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#b06f9d" />
          <stop offset="60%" stopColor="#f3b9d3" />
          <stop offset="100%" stopColor="#fff2e8" />
        </linearGradient>
        <radialGradient id="horizonGlow" cx="50%" cy="100%" r="70%">
          <stop offset="0%" stopColor="#ffd9c3" stopOpacity="0.9" />
          <stop offset="42%" stopColor="#e8a7b6" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#8b5c91" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="riverGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#b9f7ff" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#8c74ff" stopOpacity="0" />
        </radialGradient>
        <filter id="softBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
        <filter id="mistBlur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="26" />
        </filter>
        <filter id="riverBlur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id="starGlow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>

        <symbol id="flower-lavender" viewBox="-12 -40 24 44">
          <path d="M0 0 C-1 -12 1 -24 0 -38" stroke="#8a74a8" strokeWidth="1.1" fill="none" />
          {[0, 1, 2, 3, 4, 5].map(i => (
            <ellipse key={i} cx={i % 2 === 0 ? -2.6 : 2.6} cy={-34 + i * 4.4} rx="3.1" ry="2.1" fill="url(#petalGradient)" opacity={0.9 - i * 0.08} />
          ))}
        </symbol>

        <symbol id="flower-daisy" viewBox="-16 -28 32 32">
          <path d="M0 0 C1 -9 -1 -17 0 -25" stroke="#7b7097" strokeWidth="1.1" fill="none" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
            <ellipse key={i} cx="0" cy="-24" rx="2.4" ry="6.2" fill="url(#petalGradient)" transform={`rotate(${i * 45} 0 -18)`} opacity="0.9" />
          ))}
          <circle cx="0" cy="-18" r="2.8" fill="#ffe8b8" />
        </symbol>

        <symbol id="flower-bell" viewBox="-12 -34 24 36">
          <path d="M0 0 C-2 -10 1 -21 0 -32" stroke="#7b7097" strokeWidth="1" fill="none" />
          <path d="M-6 -30 C-5 -22 -2 -19 0 -17 C2 -19 5 -22 6 -30 C3 -28 -3 -28 -6 -30 Z" fill="url(#petalWarm)" opacity="0.92" />
          <circle cx="0" cy="-30" r="1.8" fill="#fff6ff" />
        </symbol>

        <symbol id="flower-star" viewBox="-12 -26 24 28">
          <path d="M0 0 C0 -8 0 -16 0 -24" stroke="#80749c" strokeWidth="1" fill="none" />
          <path d="M0 -30 L2.2 -25.6 L7 -25 L3.4 -21.2 L4.4 -16.4 L0 -18.8 L-4.4 -16.4 L-3.4 -21.2 L-7 -25 L-2.2 -25.6 Z" fill="url(#petalGradient)" opacity="0.9" />
        </symbol>

        <symbol id="grass-tuft" viewBox="-18 -34 36 36">
          <path d="M0 0 C-3 -12 -9 -20 -14 -31" stroke="#6e6685" strokeWidth="1.2" fill="none" />
          <path d="M0 0 C-1 -14 1 -23 4 -34" stroke="#847b9d" strokeWidth="1" fill="none" />
          <path d="M0 0 C4 -10 9 -17 15 -27" stroke="#665d7d" strokeWidth="1.2" fill="none" />
        </symbol>
      </defs>

      <rect width="1440" height="900" fill="url(#skyGradient)" />
      <ellipse cx="720" cy="560" rx="620" ry="270" fill="url(#horizonGlow)" filter="url(#softBlur)" />

      {/* Milky-way ribbon and soft clouds */}
      <g className="valley-aurora">
        <ellipse cx="700" cy="205" rx="360" ry="90" fill="#b875ff" opacity="0.12" filter="url(#softBlur)" transform="rotate(-16 700 205)" />
        <ellipse cx="960" cy="300" rx="250" ry="58" fill="#ff9acb" opacity="0.08" filter="url(#softBlur)" transform="rotate(-12 960 300)" />
        <path d="M-80 340 C180 260 340 330 520 280 C700 230 880 300 1120 250 C1260 220 1380 250 1500 225" stroke="#d8b6ff" strokeWidth="38" strokeOpacity="0.055" fill="none" filter="url(#softBlur)" />
      </g>

      <g className="valley-stars">
        {STARS.map((star, index) => (
          <circle
            key={index}
            cx={star.x}
            cy={star.y}
            r={star.radius}
            fill={index % 5 === 0 ? '#ffe9f7' : '#f4f0ff'}
            opacity={star.opacity}
            style={{ animationDelay: `${star.delay}s` }}
            className="valley-star"
          />
        ))}
        <circle cx="1030" cy="155" r="2.2" fill="#ffffff" filter="url(#starGlow)" opacity="0.9" />
        <circle cx="1030" cy="155" r="7" fill="#f4c6ff" opacity="0.2" filter="url(#starGlow)" />
      </g>

      {/* Distant mountain layers */}
      <g className="valley-layer valley-layer--far">
        <path d="M-40 585 L90 465 L180 515 L300 410 L405 500 L520 430 L640 510 L755 420 L880 500 L1010 405 L1120 490 L1240 425 L1360 505 L1480 450 L1480 900 L-40 900 Z" fill="url(#farMountain)" opacity="0.62" filter="url(#softBlur)" />
        <path d="M-30 620 L95 520 L190 560 L320 475 L430 555 L540 500 L665 570 L790 490 L910 560 L1035 485 L1160 555 L1285 500 L1400 565 L1470 535 L1470 900 L-30 900 Z" fill="#4a3566" opacity="0.42" filter="url(#softBlur)" />
      </g>

      {/* Mid mountains with snow-lit ridges */}
      <g className="valley-layer valley-layer--mid">
        <path d="M-60 700 L70 540 L155 585 L260 470 L355 560 L450 505 L545 610 L630 570 L740 670 L740 900 L-60 900 Z" fill="url(#midMountain)" />
        <path d="M700 690 L810 545 L900 595 L1005 485 L1100 575 L1195 520 L1290 610 L1380 560 L1480 650 L1480 900 L700 900 Z" fill="url(#midMountain)" />
        <path d="M260 470 L300 510 L275 528 L340 555 L355 560" stroke="#d8c6e9" strokeWidth="5" strokeOpacity="0.2" fill="none" />
        <path d="M1005 485 L1045 525 L1020 540 L1082 568 L1100 575" stroke="#e5d8f2" strokeWidth="4" strokeOpacity="0.22" fill="none" />
        <path d="M70 540 L102 570 L82 584 L140 580 L155 585" stroke="#cdb8e3" strokeWidth="3" strokeOpacity="0.15" fill="none" />
      </g>

      {/* Near, dark mountain silhouettes framing the valley */}
      <g className="valley-layer valley-layer--near">
        <path d="M-80 900 L-80 680 L55 575 L150 625 L245 540 L330 650 L420 610 L510 730 L560 900 Z" fill="url(#nearMountain)" />
        <path d="M880 900 L960 700 L1050 640 L1140 540 L1235 625 L1320 585 L1440 690 L1520 900 Z" fill="url(#nearMountain)" />
        <path d="M55 575 L95 605 L76 620 L128 616 L150 625" stroke="#a58cc2" strokeWidth="3" strokeOpacity="0.12" fill="none" />
        <path d="M1140 540 L1178 578 L1156 592 L1214 610 L1235 625" stroke="#b7a2d1" strokeWidth="3" strokeOpacity="0.12" fill="none" />
      </g>

      {/* Valley floor and luminous river */}
      <path d="M0 690 C220 660 380 705 560 685 C760 662 910 700 1100 678 C1240 662 1360 682 1440 668 L1440 900 L0 900 Z" fill="url(#valleyFloor)" />
      <g className="valley-river">
        <ellipse cx="775" cy="785" rx="220" ry="120" fill="url(#riverGlow)" filter="url(#softBlur)" />
        <path
          d="M705 668 C650 700 735 720 688 748 C638 778 792 792 742 818 C690 846 856 850 812 878 C782 897 850 902 900 900 L980 900 C934 884 880 870 916 846 C960 818 824 808 870 782 C918 754 786 744 834 720 C884 694 802 680 780 668 Z"
          fill="url(#riverGradient)"
          filter="url(#riverBlur)"
          opacity="0.86"
        />
        <path
          d="M720 680 C676 704 748 724 704 750 C660 776 790 794 748 818 C704 842 846 850 812 874 C788 890 846 896 884 898"
          stroke="#e8fdff"
          strokeWidth="2.2"
          strokeOpacity="0.62"
          fill="none"
          className="river-highlight"
        />
        <path
          d="M754 690 C718 712 776 730 738 752 C700 774 808 790 774 812 C742 832 862 844 836 864"
          stroke="#c7b0ff"
          strokeWidth="1.3"
          strokeOpacity="0.45"
          fill="none"
        />
      </g>

      {/* Atmospheric mist ribbons */}
      <g className="valley-mist">
        <ellipse cx="420" cy="660" rx="330" ry="52" fill="#d9c9f2" opacity="0.12" filter="url(#mistBlur)" />
        <ellipse cx="1050" cy="690" rx="390" ry="58" fill="#f4d9e6" opacity="0.1" filter="url(#mistBlur)" />
        <ellipse cx="760" cy="740" rx="480" ry="46" fill="#cbb8ee" opacity="0.09" filter="url(#mistBlur)" />
      </g>

      {/* Scattered warm and cool lights */}
      <g className="valley-lights">
        {LIGHTS.map((light, index) => (
          <circle
            key={index}
            cx={light.x}
            cy={light.y}
            r={light.radius}
            fill={light.warm ? '#ffd7b0' : '#bdf5ff'}
            opacity={0.4 + (index % 5) * 0.1}
            className="valley-light"
            style={{ animationDelay: `${light.delay}s` }}
          />
        ))}
      </g>

      {/* Foreground flower field */}
      <g className="valley-flowers">
        {FLOWERS.map((flower, index) => {
          const symbol = ['flower-lavender', 'flower-daisy', 'flower-bell', 'flower-star', 'grass-tuft'][flower.kind];
          return (
            <use
              key={index}
              href={`#${symbol}`}
              transform={`translate(${flower.x} ${flower.y}) scale(${flower.scale})`}
              opacity={flower.opacity}
              className="valley-flower"
              style={{ animationDelay: `${flower.delay}s` }}
            />
          );
        })}
        <path d="M0 900 C120 835 260 850 390 820 C520 790 650 835 790 810 C940 785 1080 830 1210 805 C1320 785 1400 810 1440 800 L1440 900 Z" fill="#150e22" opacity="0.75" />
        <path d="M0 900 C150 860 280 875 410 850 C540 825 690 862 830 842 C980 820 1110 855 1240 838 C1350 824 1410 840 1440 834 L1440 900 Z" fill="#0d0916" opacity="0.82" />
      </g>
    </svg>

    <div className="valley-haze" />
    <div className="valley-grain" />
    <div className="valley-particles">
      {Array.from({ length: 18 }, (_, index) => (
        <span
          key={index}
          className="valley-particle"
          style={{
            left: `${seeded(index, 21) * 100}%`,
            top: `${45 + seeded(index, 22) * 50}%`,
            animationDelay: `${seeded(index, 23) * 12}s`,
            animationDuration: `${12 + seeded(index, 24) * 14}s`
          }}
        />
      ))}
    </div>
  </div>
);

export default ValleyBackdrop;
