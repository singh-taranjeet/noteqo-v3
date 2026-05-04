"use client";
import { Image as ImageIcon, Loader2, Pencil } from "lucide-react";

import {
  useUpdateMedia,
  useAllMediaList,
} from "@/features/media/hooks/useMedia";
import { useSpaces } from "@/features/spaces";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { EncryptedImage } from "@/features/media/components/EncryptedImage";
import { EncryptedVideo } from "@/features/media/components/EncryptedVideo";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import type { DecryptedMedia } from "@/features/media/types/media.types";

function MediaEditPopover({
  media,
  onSave,
}: {
  media: DecryptedMedia;
  onSave: (data: { title?: string; description?: string }) => void;
}) {
  const [title, setTitle] = useState(media.title || "");
  const [description, setDescription] = useState(media.description || "");
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    onSave({ title, description });
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 absolute top-2 right-2 bg-black/20 hover:bg-black/40 text-white backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium leading-none">Edit Details</h4>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Logo"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function AssetsView() {
  const { data: spacesData } = useSpaces();
  const spaceIds = (spacesData?.spaces || []).map((s) => s.id);
  const { data: mediaList, isLoading } = useAllMediaList(spaceIds);
  const { mutate: updateMedia } = useUpdateMedia();

  return (
    <div className="flex-1 overflow-auto bg-background p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assets</h1>
          <p className="text-muted-foreground">
            Manage your uploaded media across all your spaces.
          </p>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="animate-spin h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !mediaList?.length ? (
          <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed py-24 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
            <div className="space-y-1">
              <h3 className="font-medium text-lg">No assets yet</h3>
              <p className="text-muted-foreground">
                Upload images from the Note Editor to see them here.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mediaList.map((media) => (
              <HoverCard key={media.id} openDelay={300} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <div className="group relative aspect-video cursor-pointer overflow-hidden rounded-xl border bg-muted/30 transition-all hover:scale-[1.02] hover:shadow-md hover:ring-2 hover:ring-primary/50">
                    {media.mimeType?.startsWith("video/") ? (
                      <EncryptedVideo
                        src={media.url}
                        className="h-full w-full object-contain"
                        preload="metadata"
                        spaceId={media.spaceId}
                        mimeType={media.mimeType}
                      />
                    ) : (
                      <EncryptedImage
                        src={media.url}
                        alt={media.title || ""}
                        spaceId={media.spaceId}
                        className="h-full w-full object-contain"
                      />
                    )}

                    {/* Top shadow gradient and information overlay */}
                    <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-black/80 via-black/40 to-transparent pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-3 left-3 right-12 flex flex-col pointer-events-none">
                      <p className="truncate text-sm font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        {media.title ||
                          media.url.split("/").pop()?.split("?")[0] ||
                          "Unnamed Asset"}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {media.mimeType && (
                          <span className="truncate text-[10px] font-semibold tracking-wider text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] uppercase">
                            {media.mimeType.split("/")[1] || "FILE"}
                          </span>
                        )}
                        <span className="text-[10px] text-white/60 drop-shadow-md">
                          •
                        </span>
                        <span className="truncate text-[10px] font-medium text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                          {(media.sizeBytes / 1024).toFixed(1)} KB
                        </span>
                        <span className="text-[10px] text-white/60 drop-shadow-md">
                          •
                        </span>
                        <span className="truncate text-[10px] font-medium text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                          {new Date(media.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {media.description && (
                        <p className="line-clamp-2 text-[11px] text-white/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] mt-1.5 leading-snug">
                          {media.description}
                        </p>
                      )}
                    </div>

                    <MediaEditPopover
                      media={media}
                      onSave={(data) =>
                        updateMedia({
                          mediaId: media.id,
                          spaceId: media.spaceId,
                          data,
                        })
                      }
                    />
                  </div>
                </HoverCardTrigger>
                <HoverCardContent
                  side="right"
                  align="center"
                  sideOffset={15}
                  className="w-[500px] p-0 overflow-hidden bg-black border-white/10 shadow-2xl flex items-center justify-center"
                >
                  {media.mimeType?.startsWith("video/") ? (
                    <EncryptedVideo
                      src={media.url}
                      className="w-full max-h-[70vh] object-contain"
                      controls
                      autoPlay
                      muted
                      loop
                      playsInline
                      spaceId={media.spaceId}
                      mimeType={media.mimeType}
                    />
                  ) : (
                    <EncryptedImage
                      src={media.url}
                      alt={media.title || ""}
                      spaceId={media.spaceId}
                      className="w-full max-h-[70vh] object-contain"
                    />
                  )}
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
