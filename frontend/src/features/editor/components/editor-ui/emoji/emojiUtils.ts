import emojisData from "@/data/emojis.json";

export interface EmojiItem {
  emoji: string;
  name: string;
}

// Ensure TypeScript knows the structure of the JSON file
type EmojiDataMap = Record<string, EmojiItem[]>;

// Flatten the JSON dictionary (which is grouped by category) into a single array
export const emojis: EmojiItem[] = Object.values(
  emojisData as EmojiDataMap,
).flat();

export const searchEmojis = (query: string): EmojiItem[] => {
  if (!query) {
    // Return top 10 most common or random if no query
    return emojis.slice(0, 10);
  }

  const lowercaseQuery = query.toLowerCase();

  return emojis
    .filter((item) => item.name.toLowerCase().includes(lowercaseQuery))
    .slice(0, 10);
};
