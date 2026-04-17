import React, { memo } from "react";
import type { SVGProps } from "react";

export const CardIcon = memo(
  ({ className, ...props }: SVGProps<SVGSVGElement>) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
      >
        <rect width="18" height="14" x="3" y="5" rx="2" ry="2" />
        <path d="M3 10h18" />
      </svg>
    );
  },
);

CardIcon.displayName = "CardIcon";
