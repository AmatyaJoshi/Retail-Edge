import React from "react";

interface EyeIconProps {
  open?: boolean;
  size?: number;
  className?: string;
}

// Professional SVG eye icon (open/closed)
export const EyeIcon: React.FC<EyeIconProps> = ({ open = true, size = 22, className = "" }) =>
  open ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Full eye shape */}
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" opacity="0.5" />
      {/* Pupil (faded) */}
      <circle cx="12" cy="12" r="3.5" opacity="0.3" />
      {/* Diagonal slash */}
      <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  );

export default EyeIcon;
