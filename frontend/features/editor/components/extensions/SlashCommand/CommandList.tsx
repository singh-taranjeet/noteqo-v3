import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList as CommandListWrapper,
  CommandShortcut,
  CommandSeparator,
} from "@/components/ui/command"
import type { SuggestionItem } from "@/features/editor"

interface CommandListProps {
  items: SuggestionItem[]
  command: (item: SuggestionItem) => void
  query: string
  closeMenu: () => void
}

export const CommandList = forwardRef((props: CommandListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => setSelectedIndex(0), [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
        return true
      }

      if (event.key === "ArrowDown") {
        setSelectedIndex((selectedIndex + 1) % props.items.length)
        return true
      }

      if (event.key === "Enter") {
        const item = props.items[selectedIndex]
        if (item) {
          props.command(item)
          return true
        }
      }

      return false
    },
  }))

  if (!props.items.length) {
    return null
  }

  return (
    <div className="w-64 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
      <Command shouldFilter={false} className="border-none bg-transparent">
        <CommandListWrapper>
          {props.items.length === 0 && <CommandEmpty>No results found.</CommandEmpty>}
          <CommandGroup heading="Basic blocks">
            {props.items.map((item, index) => {
              const Icon = item.icon
              return (
                <CommandItem
                  key={index}
                  onSelect={() => props.command(item)}
                  value={item.title}
                  className={cn(
                    "cursor-pointer",
                    index === selectedIndex && "bg-accent text-accent-foreground"
                  )}
                >
                  {Icon && <Icon className="mr-2 size-4" />}
                  <span>{item.title}</span>
                  {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
                </CommandItem>
              )
            })}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup>
            <CommandItem
              onSelect={props.closeMenu}
              onClick={(e) => {
                e.preventDefault()
                props.closeMenu()
              }}
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              className="cursor-pointer"
            >
              <span>Close menu</span>
              <CommandShortcut>esc</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandListWrapper>
      </Command>
    </div>
  )
})

CommandList.displayName = "CommandList"
