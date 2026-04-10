"use client"

import { useCallback, useState } from "react"
import { type Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "@/features/editor/hooks/useTiptapEditor"

// --- Icons ---
import { ChevronDownIcon } from "@/features/editor/components/icons/ChevronDownIcon"

// --- Tiptap UI ---
import { ListButton, type ListType } from "@/features/editor/components/editor-ui/ListButton"

import { useListDropdownMenu } from "@/features/editor/components/editor-ui/ListDropdownMenu/UseListDropdownMenu"

// --- UI Primitives ---
import type { ButtonProps } from "@/features/editor/components/ui/Button"
import { Button } from "@/features/editor/components/ui/Button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "@/features/editor/components/ui/DropdownMenu"

export interface ListDropdownMenuProps extends Omit<ButtonProps, "type"> {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor
  /**
   * The list types to display in the dropdown.
   */
  types?: ListType[]
  /**
   * Whether the dropdown should be hidden when no list types are available
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Callback for when the dropdown opens or closes
   */
  onOpenChange?: (isOpen: boolean) => void
  /**
   * Whether the dropdown should use a modal
   */
  modal?: boolean
}

export function ListDropdownMenu({
  editor: providedEditor,
  types = ["bulletList", "orderedList", "taskList"],
  hideWhenUnavailable = false,
  onOpenChange,
  modal = true,
  ...props
}: ListDropdownMenuProps) {
  const { editor } = useTiptapEditor(providedEditor)
  const [isOpen, setIsOpen] = useState(false)

  const { filteredLists, canToggle, isActive, isVisible, Icon } =
    useListDropdownMenu({
      editor,
      types,
      hideWhenUnavailable,
    })

  const handleOnOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open)
      onOpenChange?.(open)
    },
    [onOpenChange]
  )

  if (!isVisible) {
    return null
  }

  return (
    <DropdownMenu modal={modal} open={isOpen} onOpenChange={handleOnOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          data-active-state={isActive ? "on" : "off"}
          role="button"
          tabIndex={-1}
          disabled={!canToggle}
          data-disabled={!canToggle}
          aria-label="List options"
          tooltip="List"
          {...props}
        >
          <Icon className="tiptap-button-icon" />
          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          {filteredLists.map((option) => (
            <DropdownMenuItem key={option.type} asChild>
              <ListButton
                editor={editor}
                type={option.type}
                text={option.label}
                showTooltip={false}
              />
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ListDropdownMenu
