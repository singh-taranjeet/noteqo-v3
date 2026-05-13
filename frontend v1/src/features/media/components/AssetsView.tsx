import { Eye, Image as ImageIcon, Loader2, Pencil, X } from "lucide-react";

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
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogClose,
} from "@/components/ui/dialog";
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
          className="h-8 w-8 bg-black/40 hover:bg-black/60 text-white backdrop-blur-md rounded-full"
          onClick={(e) => e.stopPropagation()}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" onClick={(e) => e.stopPropagation()}>
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
  const [previewMedia, setPreviewMedia] = useState<DecryptedMedia | null>(null);

  return (
    <div className="flex-1 overflow-auto bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assets</h1>
          <p className="text-muted-foreground">
            Manage your uploaded media across all your spaces.
          </p>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mediaList.map((media) => (
              <div
                key={media.id}
                className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-all hover:-translate-y-1 hover:shadow-xl hover:ring-1 hover:ring-primary/50 cursor-pointer"
                onClick={() => setPreviewMedia(media)}
              >
                {/* Image container */}
                <div className="relative aspect-video w-full overflow-hidden bg-muted/30">
                  {media.mimeType?.startsWith("video/") ? (
                    <EncryptedVideo
                      src={media.url}
                      spaceId={media.spaceId}
                      mimeType={media.mimeType}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      preload="metadata"
                    />
                  ) : (
                    <EncryptedImage
                      src={media.url}
                      spaceId={media.spaceId}
                      alt={media.title || ""}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}

                  {/* Actions overlay */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    {/* View Icon (HoverCard) */}
                    <div
                      className="hidden md:block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <HoverCard openDelay={200} closeDelay={100}>
                        <HoverCardTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-black/40 hover:bg-black/60 text-white backdrop-blur-md rounded-full"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </HoverCardTrigger>
                        <HoverCardContent
                          side="left"
                          align="center"
                          sideOffset={15}
                          className="w-96 p-0 bg-black/95 border-white/10 overflow-hidden shadow-2xl flex items-center justify-center z-50"
                        >
                          {media.mimeType?.startsWith("video/") ? (
                            <EncryptedVideo
                              src={media.url}
                              className="w-full max-h-[60vh] object-contain"
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
                              className="w-full max-h-[60vh] object-contain"
                            />
                          )}
                        </HoverCardContent>
                      </HoverCard>
                    </div>

                    {/* Edit Icon */}
                    <div onClick={(e) => e.stopPropagation()}>
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
                  </div>
                </div>

                {/* Info footer */}
                <div className="flex flex-col gap-1 p-3 bg-card border-t border-border/50">
                  <p className="truncate text-sm font-medium text-foreground">
                    {media.title ||
                      media.url.split("/").pop()?.split("?")[0] ||
                      "Unnamed Asset"}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    <span>
                      {media.mimeType
                        ? media.mimeType.split("/")[1] || "FILE"
                        : "FILE"}
                    </span>
                    <span>•</span>
                    <span>{(media.sizeBytes / 1024).toFixed(1)} KB</span>
                    <span>•</span>
                    <span>
                      {new Date(media.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {media.description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground/80 mt-1">
                      {media.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Global Preview Dialog */}
      <Dialog
        open={!!previewMedia}
        onOpenChange={(open) => !open && setPreviewMedia(null)}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-[95vw] sm:max-w-[95vw] w-fit max-h-[95vh] bg-transparent border-none shadow-none p-0 flex flex-col justify-center items-center"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Preview {previewMedia?.title || "Asset"}</DialogTitle>
          </DialogHeader>
          <div className="relative flex items-center justify-center">
            {/* Custom properly aligned close button */}
            <DialogClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-50 h-10 w-10 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 shadow-xl"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>

            {previewMedia &&
              (previewMedia.mimeType?.startsWith("video/") ? (
                <EncryptedVideo
                  src={previewMedia.url}
                  className="max-w-[95vw] max-h-[90vh] w-auto h-auto object-contain rounded-xl shadow-2xl"
                  controls
                  autoPlay
                  spaceId={previewMedia.spaceId}
                  mimeType={previewMedia.mimeType}
                />
              ) : (
                <EncryptedImage
                  src={previewMedia.url}
                  alt={previewMedia?.title || "Asset Preview"}
                  spaceId={previewMedia.spaceId}
                  className="max-w-[95vw] max-h-[90vh] w-auto h-auto object-contain rounded-xl shadow-2xl"
                />
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
