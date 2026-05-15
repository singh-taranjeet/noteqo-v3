import { cn } from "@/lib/utils";
import { EncryptedImage } from "./EncryptedImage";

export function EmojiOrImage(props: { emoji: string; spaceId: string }) {
  const { emoji, spaceId } = props;
  return (
    <>
      {emoji.length > 2 && emoji.startsWith("http") ? (
        <EncryptedImage
          src={emoji}
          alt="Icon"
          spaceId={spaceId}
          className={cn("size-5 object-cover rounded-md")}
        />
      ) : (
        emoji
      )}
    </>
  );
}
