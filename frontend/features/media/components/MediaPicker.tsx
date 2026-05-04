import EmojiPicker from "emoji-picker-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaList } from "../hooks/useMedia";
import { useUploadMedia } from "../hooks/useUploadMedia";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading02Icon } from "@hugeicons/core-free-icons";
import { EncryptedImage } from "@/features/media/components/EncryptedImage";

interface MediaPickerProps {
  type: "cover" | "emoji";
  spaceId: string;
  noteId: string;
  onSelect: (value: string) => void;
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
}: MediaPickerProps) {
  const { data: mediaList, isLoading } = useMediaList(spaceId);
  const { mutateAsync: uploadMedia, isPending: isUploading } = useUploadMedia();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const response = await uploadMedia({ file, spaceId, noteId });
      onSelect(response.url);
    } catch (error) {
      console.error("Upload failed", error);
    }
  };

  return (
    <div className="w-80 p-2 bg-background">
      <Tabs defaultValue={type === "emoji" ? "emoji" : "preloaded"}>
        <TabsList className="w-full mb-4">
          {type === "emoji" && <TabsTrigger value="emoji">Emoji</TabsTrigger>}
          {type === "cover" && (
            <TabsTrigger value="preloaded">Gallery</TabsTrigger>
          )}
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
        </TabsList>

        {type === "emoji" && (
          <TabsContent value="emoji">
            <EmojiPicker
              onEmojiClick={(emojiData) => onSelect(emojiData.emoji)}
              width="100%"
            />
          </TabsContent>
        )}

        {type === "cover" && (
          <TabsContent value="preloaded">
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
          </TabsContent>
        )}

        <TabsContent value="upload">
          <div className="flex h-32 flex-col items-center justify-center space-y-4 rounded-md border border-dashed p-4">
            {isUploading ? (
              <HugeiconsIcon
                icon={Loading02Icon}
                className="h-6 w-6 animate-spin text-muted-foreground"
              />
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
                    accept="image/*"
                    onChange={handleUpload}
                  />
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="assets">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <HugeiconsIcon
                icon={Loading02Icon}
                className="h-6 w-6 animate-spin"
              />
            </div>
          ) : mediaList?.length ? (
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {mediaList.map((asset) => (
                <div
                  key={asset.id}
                  className="relative h-20 cursor-pointer overflow-hidden rounded-md border hover:opacity-80"
                  onClick={() => onSelect(asset.url)}
                  title={asset.title || "Asset"}
                >
                  <EncryptedImage
                    src={asset.url}
                    alt={asset.title || ""}
                    spaceId={spaceId}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No assets found.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
