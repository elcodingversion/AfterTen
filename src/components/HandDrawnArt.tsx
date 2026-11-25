import React from 'react';

export const CODING_JOKES = [
  'Lupa @csrf di form Laravel → langsung disambut 419 Page Expired.',
  'php artisan migrate:fresh — jurus pas tabel udah nggak ketolong.',
  'Route udah dibikin rapi, eh lupa nambahin / di URL atau typo nama controller.',
  '“Cuma kurang titik koma di Blade... eh ternyata kurung kurawal.”',
  'dd($data); adalah teman curhat terbaik selama 10 hari kelas Laravel.',
  '99 error di Laravel, benerin satu... eh muncul view not found.',
];

// Flowing hand-drawn loop-vine divider with hearts (inspired by the zine reference)
export const CurvyHeartDivider: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 420 54"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={`w-full h-auto ${className}`}
  >
    <path
      d="M4 42 C48 42, 62 12, 80 18 C92 22, 86 35, 76 34 C66 33, 64 16, 86 16 C120 16, 134 44, 178 38 C206 34, 214 14, 228 19 C238 23, 232 34, 223 32 C214 30, 214 15, 234 15 C268 15, 286 42, 328 36 C352 33, 360 14, 374 19 C383 22, 378 33, 369 31 C360 29, 362 16, 380 17 C396 18, 408 26, 416 24"
      stroke="#353630"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Tiny hand-drawn hearts along the curve */}
    <path
      d="M78 14 C75 9, 68 11, 70 17 C72 22, 78 25, 78 25 C78 25, 84 22, 86 17 C88 11, 81 9, 78 14 Z"
      fill="#FAF7F0"
      stroke="#353630"
      strokeWidth="1.4"
    />
    <path
      d="M226 15 C223 10, 216 12, 218 18 C220 23, 226 26, 226 26 C226 26, 232 23, 234 18 C236 12, 229 10, 226 15 Z"
      fill="#CFE0EE"
      stroke="#353630"
      strokeWidth="1.4"
    />
    <path
      d="M372 15 C369 10, 362 12, 364 18 C366 23, 372 26, 372 26 C372 26, 378 23, 380 18 C382 12, 375 10, 372 15 Z"
      fill="#F3DDA9"
      stroke="#353630"
      strokeWidth="1.4"
    />
  </svg>
);

// Top Welcome illustration: two sketchy hands reaching toward a tiny sparkling laptop/code heart
export const TopHandsCodeArt: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    width="360"
    height="125"
    viewBox="0 0 360 125"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={`w-full max-w-[330px] mx-auto h-auto block ${className}`}
  >
    {/* Left sleeve + hand */}
    <path d="M52 2 L74 44 L50 56 L26 12" fill="#353630" />
    <path
      d="M74 44 C82 54, 96 60, 114 63 C126 65, 134 62, 136 57 C138 52, 128 49, 117 48 C126 45, 136 42, 136 37 C136 32, 124 33, 112 36 C118 28, 122 22, 118 19 C113 16, 102 27, 94 34 L74 44 Z"
      fill="#FAF7F0"
      stroke="#353630"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    {/* Right hand */}
    <path
      d="M312 4 L276 48 C268 58, 252 63, 236 62 C224 61, 218 57, 220 52 C222 47, 232 46, 242 47 C232 42, 222 38, 223 33 C224 28, 236 30, 248 35 C242 26, 239 19, 244 16 C249 13, 259 25, 265 34 L294 2"
      fill="#FAF7F0"
      stroke="#353630"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    {/* Center floating little code tag & soft blue sparkle */}
    <rect
      x="156"
      y="44"
      width="48"
      height="32"
      rx="6"
      fill="#CFE0EE"
      stroke="#353630"
      strokeWidth="1.6"
    />
    <path
      d="M171 56 L165 60 L171 64 M189 56 L195 60 L189 64 M182 53 L178 67"
      stroke="#353630"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M180 20 L182 28 L190 30 L182 32 L180 40 L178 32 L170 30 L178 28 Z"
      fill="#F3DDA9"
      stroke="#353630"
      strokeWidth="1.3"
    />
  </svg>
);

// Bottom Welcome illustration: two happy learners walking with laptop & coffee
export const WalkingLearnersArt: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    width="280"
    height="120"
    viewBox="0 0 280 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={`w-full max-w-[260px] mx-auto h-auto block ${className}`}
  >
    {/* Person 1 (left) */}
    <circle cx="96" cy="24" r="10" fill="#FAF7F0" stroke="#353630" strokeWidth="1.6" />
    <path d="M88 20 C90 12, 105 12, 107 24 C107 30, 111 35, 110 39" stroke="#353630" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M85 38 L108 38 L113 76 L79 76 Z" fill="#DCE5D6" stroke="#353630" strokeWidth="1.6" strokeLinejoin="round" />
    {/* Legs */}
    <path d="M90 76 L80 108 M102 76 L112 108" stroke="#353630" strokeWidth="1.8" strokeLinecap="round" />
    {/* Coffee cup in left hand */}
    <rect x="65" y="54" width="11" height="13" rx="2" fill="#F3DDA9" stroke="#353630" strokeWidth="1.4" />
    <path d="M85 44 L73 56" stroke="#353630" strokeWidth="1.6" strokeLinecap="round" />
    {/* Holding hands / walking together */}
    <path d="M108 46 L132 54" stroke="#353630" strokeWidth="1.6" strokeLinecap="round" />

    {/* Person 2 (right) */}
    <circle cx="174" cy="22" r="10" fill="#FAF7F0" stroke="#353630" strokeWidth="1.6" />
    <path d="M165 18 C168 10, 182 11, 184 19" stroke="#353630" strokeWidth="2.4" strokeLinecap="round" />
    <rect x="161" y="36" width="26" height="36" rx="4" fill="#CFE0EE" stroke="#353630" strokeWidth="1.6" />
    <path d="M168 72 L158 108 M180 72 L192 108" stroke="#353630" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M161 44 L132 54" stroke="#353630" strokeWidth="1.6" strokeLinecap="round" />
    {/* Laptop bag / book under arm */}
    <rect x="184" y="46" width="18" height="14" rx="2" fill="#E8DFF2" stroke="#353630" strokeWidth="1.4" />
    <path d="M187 42 L192 52" stroke="#353630" strokeWidth="1.6" strokeLinecap="round" />

    {/* Little ground line + pixel heart */}
    <path d="M54 110 L224 110" stroke="#353630" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="4 4" />
    <path
      d="M135 28 C132 23, 125 25, 127 31 C129 36, 135 39, 135 39 C135 39, 141 36, 143 31 C145 25, 138 23, 135 28 Z"
      fill="#F3DDA9"
      stroke="#353630"
      strokeWidth="1.3"
    />
  </svg>
);

// Small ink doodles for the winding timeline path
export const CoffeeInkDoodle: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true" className={className}>
    <path d="M16 9 C14 5, 18 4, 17 2 M24 9 C22 5, 26 4, 25 2" stroke="#353630" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M11 15 L31 15 L29 33 C29 36, 26 38, 21 38 C16 38, 13 36, 13 33 Z" fill="#F3DDA9" stroke="#353630" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M31 19 C36 19, 37 26, 31 27" stroke="#353630" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const LaptopInkDoodle: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg width="48" height="44" viewBox="0 0 48 44" fill="none" aria-hidden="true" className={className}>
    <rect x="9" y="9" width="30" height="20" rx="2.5" fill="#CFE0EE" stroke="#353630" strokeWidth="1.5" />
    <path d="M4 31 L44 31 L41 36 L7 36 Z" fill="#FAF7F0" stroke="#353630" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M19 16 L15 19 L19 22 M29 16 L33 19 L29 22" stroke="#353630" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const CameraInkDoodle: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg width="46" height="42" viewBox="0 0 46 42" fill="none" aria-hidden="true" className={className}>
    <path d="M14 11 L17 7 L29 7 L32 11 H38 C40 11, 41 12, 41 14 V32 C41 34, 40 35, 38 35 H8 C6 35, 5 34, 5 32 V14 C5 12, 6 11, 8 11 Z" fill="#DCE5D6" stroke="#353630" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="23" cy="23" r="6.5" fill="#FAF7F0" stroke="#353630" strokeWidth="1.5" />
    <circle cx="34" cy="16" r="1.5" fill="#353630" />
  </svg>
);

export const HeartPairInkDoodle: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg width="48" height="42" viewBox="0 0 48 42" fill="none" aria-hidden="true" className={className}>
    <path d="M16 14 C13 9, 6 11, 8 18 C10 24, 16 28, 16 28 C16 28, 22 24, 24 18 C26 11, 19 9, 16 14 Z" fill="#E8DFF2" stroke="#353630" strokeWidth="1.5" />
    <path d="M32 16 C29 11, 22 13, 24 20 C26 26, 32 30, 32 30 C32 30, 38 26, 40 20 C42 13, 35 11, 32 16 Z" fill="#CFE0EE" stroke="#353630" strokeWidth="1.5" />
    <path d="M13 28 L12 36 M19 28 L20 36 M29 30 L28 37 M35 30 L36 37" stroke="#353630" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const ColorSwatchHearts: React.FC<{ className?: string }> = ({ className = '' }) => {
  const colors = ['#353630', '#A7C6DF', '#DCE5D6', '#E8DFF2', '#F3DDA9'];
  return (
    <div className={`flex items-center justify-center gap-3.5 ${className}`} aria-hidden="true">
      {colors.map((fill) => (
        <svg key={fill} width="26" height="24" viewBox="0 0 26 24" fill="none">
          <path
            d="M13 5 C10 0.5, 2 2, 3.5 9.5 C5 16, 13 21.5, 13 21.5 C13 21.5, 21 16, 22.5 9.5 C24 2, 16 0.5, 13 5 Z"
            fill={fill}
            stroke="#353630"
            strokeWidth="1.2"
          />
        </svg>
      ))}
    </div>
  );
};

export const PixelStarButton: React.FC<{
  onClick?: () => void;
  className?: string;
  label?: string;
}> = ({ onClick, className = '', label = 'Klik buat recehan kelas' }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#CFE0EE] hover:bg-[#F3DDA9] border border-[#353630] transition-transform duration-150 hover:scale-110 cursor-pointer ${className}`}
  >
    <svg width="16" height="16" viewBox="0 0 9 9" fill="none" aria-hidden="true">
      <rect x="4" y="0" width="1" height="2" fill="#353630" />
      <rect x="4" y="7" width="1" height="2" fill="#353630" />
      <rect x="0" y="4" width="2" height="1" fill="#353630" />
      <rect x="7" y="4" width="2" height="1" fill="#353630" />
      <rect x="2" y="2" width="1" height="1" fill="#353630" />
      <rect x="6" y="2" width="1" height="1" fill="#353630" />
      <rect x="2" y="6" width="1" height="1" fill="#353630" />
      <rect x="6" y="6" width="1" height="1" fill="#353630" />
      <rect x="3" y="3" width="3" height="3" fill="#FAF7F0" />
      <rect x="4" y="4" width="1" height="1" fill="#353630" />
    </svg>
  </button>
);

export const PixelHeartMark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg width="15" height="13" viewBox="0 0 9 8" fill="none" aria-hidden="true" className={className}>
    <rect x="1" y="0" width="2" height="1" fill="currentColor" />
    <rect x="6" y="0" width="2" height="1" fill="currentColor" />
    <rect x="0" y="1" width="4" height="2" fill="currentColor" />
    <rect x="5" y="1" width="4" height="2" fill="currentColor" />
    <rect x="1" y="3" width="7" height="2" fill="currentColor" />
    <rect x="2" y="5" width="5" height="1" fill="currentColor" />
    <rect x="3" y="6" width="3" height="1" fill="currentColor" />
    <rect x="4" y="7" width="1" height="1" fill="currentColor" />
  </svg>
);

export const OrganicPaperBackdrop: React.FC = () => (
  <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
    <svg className="absolute -top-24 -right-24 w-[440px] h-[440px] opacity-80" viewBox="0 0 400 400" fill="none">
      <path
        d="M312.5 78.2C354.8 119.4 373.9 187.8 351.2 243.5C328.5 299.2 264 342.1 196.7 351.4C129.4 360.7 59.3 336.4 35.4 282.3C11.5 228.2 33.8 144.3 79.1 94.7C124.4 45.1 192.7 29.8 247.3 40.9C301.9 52 270.2 37 312.5 78.2Z"
        fill="#CFE0EE"
      />
    </svg>
    <svg className="absolute top-[40%] -left-32 w-[380px] h-[380px] opacity-75" viewBox="0 0 400 400" fill="none">
      <path
        d="M289.4 64.1C336.9 95.3 368.3 157.8 355.2 215.4C342.1 273 284.5 325.7 220.4 342.8C156.3 359.9 85.7 341.4 48.9 293.1C12.1 244.8 9.1 166.7 42.3 108.4C75.5 50.1 144.9 11.6 205.8 18.2C266.7 24.8 241.9 32.9 289.4 64.1Z"
        fill="#DCE5D6"
      />
    </svg>
    <svg className="absolute -bottom-28 right-[12%] w-[360px] h-[360px] opacity-70" viewBox="0 0 400 400" fill="none">
      <path
        d="M276.2 72.8C323.7 104.2 356.2 162.5 344.9 216.2C333.6 269.9 278.5 319 216.1 334.6C153.7 350.2 84 332.3 48.2 286.1C12.4 239.9 10.5 165.4 43.9 110.1C77.3 54.8 146 18.7 205.6 25.1C265.2 31.5 228.7 41.4 276.2 72.8Z"
        fill="#E8DFF2"
      />
    </svg>
  </div>
);
