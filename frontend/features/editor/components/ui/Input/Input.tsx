"use client"

import { cn } from "@/features/editor/utils/tiptapUtils"
import "@/features/editor/components/ui/Input/Input.scss"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="tiptap-input"
      className={cn("tiptap-input", className)}
      {...props}
    />
  )
}

export { Input }
