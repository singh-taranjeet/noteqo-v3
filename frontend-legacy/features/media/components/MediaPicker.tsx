import { Loader2, UploadCloud, Search } from "lucide-react";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaList } from "../hooks/useMedia";
import { useUploadMedia } from "../hooks/useUploadMedia";
import { cn } from "@/lib/utils";

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
    <div
      className={
        isAttachment
          ? "w-full p-4 pt-12 sm:p-6 sm:pt-10 bg-transparent"
          : "w-[calc(100vw-2rem)] sm:w-80 max-w-full p-2 pt-12 sm:pt-2 bg-transparent"
      }
    >
      <Tabs
        defaultValue={defaultTab}
        className={cn("gap-1", isAttachment && "mt-2")}
      >
        <TabsList className="w-full">
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

        <TabsContent value="upload" className="mt-2">
          <div className="group relative flex h-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/5 pointer-events-none" />
            {isUploading && !onFileSelect ? (
              <div className="flex flex-col items-center gap-3 z-10">
                <div className="rounded-full bg-primary/20 p-3 animate-pulse">
                  <Loader2 className="animate-spin h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-primary">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 z-10 pointer-events-none">
                <div className="rounded-full bg-background/80 shadow-sm border border-border/50 p-4 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                  <UploadCloud className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Click to browse files
                  </p>
                  <p className="text-xs text-muted-foreground px-4">
                    Supports images and videos depending on context
                  </p>
                </div>
              </div>
            )}
            <input
              type="file"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0 z-20"
              accept={effectiveAccept}
              onChange={handleUpload}
              disabled={isUploading && !onFileSelect}
            />
          </div>
        </TabsContent>

        <TabsContent value="assets" className="flex flex-col space-y-4 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 w-full text-sm rounded-xl bg-muted/40 border-transparent shadow-none focus-visible:ring-1 focus-visible:bg-background transition-colors"
            />
          </div>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : imageAssets.length ? (
            <ScrollArea className="h-72 w-full pr-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-1 pb-4">
                {imageAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="group flex flex-col cursor-pointer overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md hover:ring-2 hover:ring-primary/50"
                    onClick={() => onSelect(asset.url, asset)}
                    title={asset.title || "Asset"}
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-muted/30">
                      {asset.mimeType?.startsWith("video/") ? (
                        <EncryptedVideo
                          src={asset.url}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          preload="metadata"
                          spaceId={spaceId}
                          mimeType={asset.mimeType}
                        />
                      ) : (
                        <EncryptedImage
                          src={asset.url}
                          alt={asset.title || ""}
                          spaceId={spaceId}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                    </div>
                    <div className="p-2 border-t border-border/50 bg-muted/10">
                      <p className="truncate text-xs font-medium text-foreground">
                        {asset.title ||
                          asset.url.split("/").pop()?.split("?")[0]}
                      </p>
                      {asset.mimeType && (
                        <p className="truncate text-xs font-bold tracking-wider text-muted-foreground mt-0.5 uppercase">
                          {asset.mimeType.split("/")[1] || "FILE"}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground border-2 border-dashed rounded-xl border-border/50">
              No matching assets found.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
