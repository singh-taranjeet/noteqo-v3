import React, { memo } from "react";
import type { SVGProps } from "react";

export const AccordionIcon = memo(
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
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h7" />
        <path d="m14 15 3 3 3-3" />
      </svg>
    );
  },
);

AccordionIcon.displayName = "AccordionIcon";
