"use client";
import { Image, Loader2, Pencil } from "lucide-react";

import {
  useUpdateMedia,
  useAllMediaList,
} from "@/features/media/hooks/useMedia";
import { useSpaces } from "@/features/spaces";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EncryptedImage } from "@/features/media/components/EncryptedImage";
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
          className="h-8 w-8 absolute top-2 right-2 bg-background/50 hover:bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
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
            <Image className="h-12 w-12 text-muted-foreground" />
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
              <Card key={media.id} className="overflow-hidden group relative">
                <div className="aspect-square relative bg-muted">
                  <EncryptedImage
                    src={media.url}
                    alt={media.title || "Asset"}
                    spaceId={media.spaceId}
                    className="h-full w-full object-cover"
                  />
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
                <CardHeader className="p-4">
                  <CardTitle className="text-base truncate">
                    {media.title || "Unnamed Asset"}
                  </CardTitle>
                  {media.description && (
                    <CardDescription className="line-clamp-2 text-xs mb-1">
                      {media.description}
                    </CardDescription>
                  )}
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span>
                      {new Date(media.createdAt).toLocaleDateString()}
                    </span>
                    <span>{(media.sizeBytes / 1024).toFixed(1)} KB</span>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
