import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";

interface BreadcrumbEntry {
  emoji: string;
  label: string;
}

interface HeaderBreadcrumbProps {
  items?: BreadcrumbEntry[];
}

const MOCK_BREADCRUMB: BreadcrumbEntry[] = [
  { emoji: "📚", label: "Installation guides" },
  { emoji: "🌝", label: "Install Mvn" },
];

export function HeaderBreadcrumb({
  items = MOCK_BREADCRUMB,
}: HeaderBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <React.Fragment key={item.label}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              <BreadcrumbLink className="flex items-center gap-1 text-sm cursor-pointer">
                <span role="img" aria-hidden="true" className="shrink-0">
                  {item.emoji}
                </span>
                <span className="truncate">{item.label}</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
