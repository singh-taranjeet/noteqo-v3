import React, { useState, useEffect } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MoreVertical,
  Copy,
  Trash,
  Files,
  MessageSquare,
  Clock,
  User,
  Send,
  Info,
} from "lucide-react";
import type { CustomAction } from "./withBlockWrapper";
import type { BlockComment } from "../extensions/BlockMetadata/BlockMetadataExtension";

interface BlockWrapperProps extends NodeViewProps {
  children: React.ReactNode;
  customActions?: CustomAction[];
}

export function BlockWrapper({
  node,
  deleteNode,
  editor,
  getPos,
  updateAttributes,
  children,
  customActions = [],
}: BlockWrapperProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");

  const blockDescription = node.attrs.blockDescription as string | null;
  const blockComments = (node.attrs.blockComments || []) as BlockComment[];
  const editedBy = node.attrs.editedBy as string | null;
  const updatedAt = node.attrs.updatedAt as string | null;
  const isEditable = editor.isEditable;

  useEffect(() => {
    setDescriptionInput(blockDescription || "");
  }, [blockDescription]);

  const handleDuplicate = () => {
    if (typeof getPos !== "function") return;
    const pos = getPos();
    editor
      .chain()
      .insertContentAt(pos + node.nodeSize, node.toJSON())
      .focus()
      .run();
  };

  const handleCopy = () => {
    if (typeof getPos !== "function") return;
    const pos = getPos();
    // Tiptap provides commands to set selection, then copy
    editor.commands.setNodeSelection(pos);
    document.execCommand("copy");
    // Restore selection is tricky, so just focus back
    editor.commands.focus();
  };

  const handleAddComment = () => {
    if (!commentInput.trim()) return;

    const profileRaw = localStorage.getItem("userProfile");
    let userName = "User";
    let userId = "user-id";
    if (profileRaw) {
      try {
        const parsed = JSON.parse(profileRaw);
        if (parsed?.email) {
          userName = parsed.email.split("@")[0];
          userId = parsed.id || userId;
        }
      } catch {
        // ignore
      }
    }

    const newComment: BlockComment = {
      id: crypto.randomUUID(),
      userId,
      userName,
      content: commentInput.trim(),
      createdAt: new Date().toISOString(),
    };

    updateAttributes({
      blockComments: [...blockComments, newComment],
    });
    setCommentInput("");
  };

  const handleUpdateDescription = () => {
    updateAttributes({
      blockDescription: descriptionInput.trim() || null,
    });
  };

  const formatDate = (isoStr: string) => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(new Date(isoStr));
    } catch {
      return isoStr;
    }
  };

  return (
    <NodeViewWrapper
      className="group relative my-4 rounded-md border border-transparent transition-colors hover:border-border"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Content */}
      <div className="relative z-0">{children}</div>

      {/* Floating Toolbar */}
      {isEditable && isHovered && (
        <div className="absolute -right-2 -top-3 z-10 flex items-center gap-1 rounded-md border bg-background p-1 shadow-sm opacity-100 transition-opacity">
          {/* Custom Actions */}
          {customActions.map((action, idx) => (
            <Button
              key={idx}
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={action.onClick}
              title={action.label}
            >
              {action.icon}
            </Button>
          ))}

          {customActions.length > 0 && (
            <div className="mx-1 h-4 w-px bg-border" />
          )}

          {/* Description Popover */}
          <Popover onOpenChange={(open) => {
            if (open) setDescriptionInput(blockDescription || "");
          }}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground"
                title="Add Description"
              >
                <Info size={14} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="end">
              <div className="space-y-2">
                <h4 className="text-sm font-medium leading-none">
                  Block Description
                </h4>
                <p className="text-xs text-muted-foreground">
                  Add context for this block.
                </p>
                <div className="flex gap-2">
                  <Input
                    className="h-8 text-xs"
                    placeholder="Enter description..."
                    value={descriptionInput}
                    onChange={(e) => setDescriptionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUpdateDescription();
                      }
                    }}

                  />
                  <Button
                    size="sm"
                    className="h-8"
                    onClick={handleUpdateDescription}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Comments Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground relative"
                title="Comments"
              >
                <MessageSquare size={14} />
                {blockComments.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary text-[8px] text-primary-foreground">
                    {blockComments.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex flex-col h-full max-h-[300px]">
                <div className="p-3 border-b">
                  <h4 className="text-sm font-medium">
                    Thread ({blockComments.length})
                  </h4>
                </div>
                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-4">
                    {blockComments.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        No comments yet.
                      </p>
                    ) : (
                      blockComments.map((comment) => (
                        <div key={comment.id} className="flex gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px]">
                              {comment.userName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs font-medium">
                                {comment.userName}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-xs text-foreground mt-0.5">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
                <div className="p-3 border-t bg-muted/50">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddComment();
                    }}
                    className="flex items-center gap-2"
                  >
                    <Input
                      placeholder="Reply..."
                      className="h-8 text-xs bg-background"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                    >
                      <Send size={14} />
                    </Button>
                  </form>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground"
              >
                <MoreVertical size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Files className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={deleteNode}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Metadata Footer */}
      {(blockDescription || editedBy) && (
        <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground opacity-50 transition-opacity group-hover:opacity-100 px-1">
          <div className="flex items-center gap-1 truncate max-w-[70%]">
            {blockDescription && (
              <>
                <Info size={10} className="shrink-0" />
                <span className="truncate">{blockDescription}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {editedBy && updatedAt && (
              <div className="flex items-center gap-1">
                <User size={10} />
                <span>{editedBy}</span>
                <Clock size={10} className="ml-1" />
                <span>{formatDate(updatedAt)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </NodeViewWrapper>
  );
}
