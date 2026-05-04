import { Loader2 } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaList } from "../hooks/useMedia";
import { useUploadMedia } from "../hooks/useUploadMedia";
import { Button } from "@/components/ui/button";
import { EncryptedImage } from "@/features/media/components/EncryptedImage";
import { EncryptedVideo } from "@/features/media/components/EncryptedVideo";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DecryptedMedia } from "../types/media.types";

interface MediaPickerProps {
  type: "cover" | "emoji" | "attachment";
  spaceId: string;
  noteId: string;
  onSelect: (value: string, asset?: DecryptedMedia) => void;
  onFileSelect?: (file: File) => void;
  accept?: string;
}

const PRELOADED_COVERS = [
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80",
  "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&q=80",
  "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=800&q=80",
  "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80",
];

export function MediaPicker({
  type,
  spaceId,
  noteId,
  onSelect,
  onFileSelect,
  accept,
}: MediaPickerProps) {
  const { data: mediaList, isLoading } = useMediaList(spaceId);
  const { mutateAsync: uploadMedia, isPending: isUploading } = useUploadMedia();
  const [searchQuery, setSearchQuery] = useState("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (onFileSelect) {
      onFileSelect(file);
      return;
    }

    try {
      const response = await uploadMedia({ file, spaceId, noteId });
      onSelect(response.url);
    } catch (error) {
      console.error("Upload failed", error);
    }
  };

  const isAttachment = type === "attachment";
  const defaultTab = isAttachment
    ? "upload"
    : type === "emoji"
      ? "emoji"
      : "preloaded";

  const effectiveAccept =
    accept || (type === "attachment" ? "image/*,video/*" : "image/*");

  const imageAssets =
    mediaList?.filter((asset) => {
      const isImage = asset.mimeType?.startsWith("image/");
      const isVideo = asset.mimeType?.startsWith("video/");

      const allowsImage = effectiveAccept.includes("image");
      const allowsVideo = effectiveAccept.includes("video");

      if (isImage && !allowsImage) return false;
      if (isVideo && !allowsVideo) return false;
      if (!isImage && !isVideo) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = asset.title?.toLowerCase().includes(q);
        const descMatch = asset.description?.toLowerCase().includes(q);
        return titleMatch || descMatch;
      }
      return true;
    }) || [];

  return (
    <div className="w-80 p-2 bg-transparent">
      <Tabs defaultValue={defaultTab}>
        <TabsList className="w-full mb-4">
          {!isAttachment && type === "emoji" && (
            <TabsTrigger value="emoji">Emoji</TabsTrigger>
          )}
          {!isAttachment && type === "cover" && (
            <TabsTrigger value="preloaded">Gallery</TabsTrigger>
          )}
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
        </TabsList>

        {!isAttachment && type === "emoji" && (
          <TabsContent value="emoji">
            <EmojiPicker
              onEmojiClick={(emojiData) => onSelect(emojiData.emoji)}
              width="100%"
            />
          </TabsContent>
        )}

        {!isAttachment && type === "cover" && (
          <TabsContent value="preloaded">
            <ScrollArea className="h-64 w-full pr-3">
              <div className="grid grid-cols-2 gap-2">
                {PRELOADED_COVERS.map((url) => (
                  <div
                    key={url}
                    className="relative h-20 cursor-pointer overflow-hidden rounded-md border hover:opacity-80"
                    onClick={() => onSelect(url)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt="Cover"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        )}

        <TabsContent value="upload">
          <div className="flex h-32 flex-col items-center justify-center space-y-4 rounded-md border border-dashed p-4">
            {isUploading && !onFileSelect ? (
              <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Choose a file to upload
                </p>
                <div className="relative">
                  <Button variant="outline">Select File</Button>
                  <input
                    type="file"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    accept={effectiveAccept}
                    onChange={handleUpload}
                  />
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="assets" className="flex flex-col space-y-4">
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          {isLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : imageAssets.length ? (
            <ScrollArea className="h-64 w-full pr-3">
              <div className="grid grid-cols-2 gap-2">
                {imageAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="group relative aspect-video cursor-pointer overflow-hidden rounded-xl border bg-muted/30 transition-all hover:scale-[1.02] hover:shadow-md hover:ring-2 hover:ring-primary/50"
                    onClick={() => onSelect(asset.url, asset)}
                    title={asset.title || "Asset"}
                  >
                    {asset.mimeType?.startsWith("video/") ? (
                      <EncryptedVideo
                        src={asset.url}
                        className="h-full w-full object-contain"
                        preload="metadata"
                        spaceId={spaceId}
                        mimeType={asset.mimeType}
                      />
                    ) : (
                      <EncryptedImage
                        src={asset.url}
                        alt={asset.title || ""}
                        spaceId={spaceId}
                        className="h-full w-full object-contain"
                      />
                    )}

                    {/* Top shadow gradient and information overlay */}
                    <div className="absolute inset-x-0 top-0 h-16 bg-linear-to-b from-black/80 to-transparent pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-2 left-2 right-2 flex flex-col pointer-events-none">
                      <p className="truncate text-xs font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        {asset.title ||
                          asset.url.split("/").pop()?.split("?")[0]}
                      </p>
                      {asset.mimeType && (
                        <p className="truncate text-[9px] font-medium tracking-wider text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] mt-0.5 uppercase">
                          {asset.mimeType.split("/")[1] || "FILE"}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No matching assets found.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
