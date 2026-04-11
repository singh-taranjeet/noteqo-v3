"use client"

import React from "react"
import { Editor } from "@tiptap/react"
import { EditorPopover } from "@/features/editor/components/editor-ui/EditorPopover"
import { Toggle } from "@/components/ui/toggle"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { MoreVerticalIcon } from "@/features/editor/components/icons/MoreVerticalIcon"
import { SuperscriptIcon } from "@/features/editor/components/icons/SuperscriptIcon"
import { SubscriptIcon } from "@/features/editor/components/icons/SubscriptIcon"
import { AlignLeftIcon } from "@/features/editor/components/icons/AlignLeftIcon"
import { AlignCenterIcon } from "@/features/editor/components/icons/AlignCenterIcon"
import { AlignRightIcon } from "@/features/editor/components/icons/AlignRightIcon"
import { AlignJustifyIcon } from "@/features/editor/components/icons/AlignJustifyIcon"

interface MoreOptionsPopoverProps {
  editor: Editor
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

const MORE_OPTIONS_GROUPS = [
  [
    { name: "superscript", tooltip: "Superscript", icon: SuperscriptIcon, command: (editor: Editor) => editor.chain().focus().toggleSuperscript().run(), isActive: (editor: Editor) => editor.isActive("superscript") },
    { name: "subscript", tooltip: "Subscript", icon: SubscriptIcon, command: (editor: Editor) => editor.chain().focus().toggleSubscript().run(), isActive: (editor: Editor) => editor.isActive("subscript") },
  ],
  [
    { name: "align-left", tooltip: "Align Left", icon: AlignLeftIcon, command: (editor: Editor) => editor.chain().focus().setTextAlign("left").run(), isActive: (editor: Editor) => editor.isActive({ textAlign: "left" }) },
    { name: "align-center", tooltip: "Align Center", icon: AlignCenterIcon, command: (editor: Editor) => editor.chain().focus().setTextAlign("center").run(), isActive: (editor: Editor) => editor.isActive({ textAlign: "center" }) },
    { name: "align-right", tooltip: "Align Right", icon: AlignRightIcon, command: (editor: Editor) => editor.chain().focus().setTextAlign("right").run(), isActive: (editor: Editor) => editor.isActive({ textAlign: "right" }) },
    { name: "align-justify", tooltip: "Justify", icon: AlignJustifyIcon, command: (editor: Editor) => editor.chain().focus().setTextAlign("justify").run(), isActive: (editor: Editor) => editor.isActive({ textAlign: "justify" }) },
  ]
]

export const MoreOptionsPopover: React.FC<MoreOptionsPopoverProps> = ({ editor, isOpen, onOpenChange }) => {
  return (
    <EditorPopover 
      isOpen={isOpen} 
      onOpenChange={onOpenChange}
      align="center"
      contentClassName="w-auto p-1 flex flex-row items-center gap-1 z-50"
      tooltipText="More options"
      trigger={
         <Toggle
           type="button"
           size="sm"
           pressed={isOpen}
           aria-label="More options"
           className="rounded-sm p-1.5 h-auto min-w-0 data-[state=on]:bg-muted"
         >
           <MoreVerticalIcon className="w-4 h-4" />
         </Toggle>
      }
    >
        <TooltipProvider delayDuration={200}>
          {MORE_OPTIONS_GROUPS.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              {groupIndex > 0 && <Separator orientation="vertical" className="h-5 mx-1" />}
              {group.map((option) => {
                const active = option.isActive(editor)
                return (
                  <Tooltip key={option.name}>
                    <TooltipTrigger asChild>
                      <Toggle
                        type="button"
                        size="sm"
                        pressed={active}
                        onPressedChange={() => {
                          option.command(editor)
                        }}
                        aria-label={option.tooltip}
                        className="rounded-sm p-1.5 h-auto min-w-0"
                      >
                        <option.icon className="w-4 h-4" />
                      </Toggle>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {option.tooltip}
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </React.Fragment>
          ))}
        </TooltipProvider>
    </EditorPopover>
  )
}
