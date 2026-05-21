import { ySyncPluginKey } from "y-prosemirror";
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

export interface BlockComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface BlockMetadataOptions {
  types: string[];
}

export const BlockMetadataExtension = Extension.create<BlockMetadataOptions>({
  name: "blockMetadata",

  addOptions() {
    return {
      types: [
        "callout",
        "card",
        "codeBlock",
        "encryptedImage",
        "encryptedVideo",
        "encryptedAudio",
        "encryptedFile",
        "embed",
        "bookmark",
        "accordion",
        "toc",
        "date",
      ],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          blockDescription: {
            default: null,
            parseHTML: (element) =>
              element.getAttribute("data-block-description"),
            renderHTML: (attributes) => {
              if (!attributes.blockDescription) {
                return {};
              }
              return { "data-block-description": attributes.blockDescription };
            },
          },
          blockComments: {
            default: [],
            parseHTML: (element) => {
              const commentsStr = element.getAttribute("data-block-comments");
              if (!commentsStr) return [];
              try {
                return JSON.parse(commentsStr);
              } catch {
                return [];
              }
            },
            renderHTML: (attributes) => {
              if (
                !attributes.blockComments ||
                attributes.blockComments.length === 0
              ) {
                return {};
              }
              return {
                "data-block-comments": JSON.stringify(attributes.blockComments),
              };
            },
          },
          editedBy: {
            default: null,
            parseHTML: (element) => element.getAttribute("data-edited-by"),
            renderHTML: (attributes) => {
              if (!attributes.editedBy) {
                return {};
              }
              return { "data-edited-by": attributes.editedBy };
            },
          },
          updatedAt: {
            default: null,
            parseHTML: (element) => element.getAttribute("data-updated-at"),
            renderHTML: (attributes) => {
              if (!attributes.updatedAt) {
                return {};
              }
              return { "data-updated-at": attributes.updatedAt };
            },
          },
        },
      },
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("blockMetadataAutoUpdate"),
        appendTransaction: (transactions, _oldState, newState) => {
          // Check if any transaction is a user-initiated change
          const isDocChanged = transactions.some((tr) => tr.docChanged);
          // Don't intercept metadata-only updates, otherwise it creates infinite loops.
          const isMetadataUpdate = transactions.some((tr) =>
            tr.getMeta("isMetadataUpdate"),
          );

          // Ignore transactions that come from Yjs (remote updates)
          const isRemoteSync = transactions.some((tr) =>
            tr.getMeta(ySyncPluginKey),
          );

          if (!isDocChanged || isMetadataUpdate || isRemoteSync) {
            return;
          }

          const tr = newState.tr;
          let modified = false;

          // Read current user asynchronously if needed, but since appendTransaction is synchronous,
          // we'll use a globally cached user info or fallback to generic "User" if not available immediately.
          // Note: Full real-time user info is best handled by the awareness state, but we will use
          // localStorage synchronously here for the fallback if possible, or skip editedBy if not present.
          const profileRaw = localStorage.getItem("userProfile");
          let userName = "User";
          if (profileRaw) {
            try {
              const parsed = JSON.parse(profileRaw);
              if (parsed?.email) {
                userName = parsed.email.split("@")[0];
              }
            } catch {
              // ignore
            }
          }

          const now = new Date().toISOString();

          // We iterate through all changed nodes.
          const changedRanges: { from: number; to: number }[] = [];

          transactions.forEach((transaction, i) => {
            transaction.steps.forEach((step, stepIndex) => {
              step.getMap().forEach((_oldStart, _oldEnd, newStart, newEnd) => {
                let from = transaction.mapping
                  .slice(stepIndex + 1)
                  .map(newStart);
                let to = transaction.mapping.slice(stepIndex + 1).map(newEnd);

                for (let j = i + 1; j < transactions.length; j++) {
                  from = transactions[j].mapping.map(from);
                  to = transactions[j].mapping.map(to);
                }

                changedRanges.push({ from, to });
              });
            });
          });

          const docSize = newState.doc.nodeSize;
          const updatedPositions = new Set<number>();

          changedRanges.forEach(({ from, to }) => {
            const safeFrom = Math.max(0, Math.min(from, docSize - 1));
            const safeTo = Math.max(0, Math.min(to, docSize - 1));

            if (safeFrom <= safeTo) {
              newState.doc.nodesBetween(safeFrom, safeTo, (node, pos) => {
                if (this.options.types.includes(node.type.name)) {
                  if (!updatedPositions.has(pos)) {
                    tr.setNodeMarkup(pos, undefined, {
                      ...node.attrs,
                      updatedAt: now,
                      editedBy: userName,
                    });
                    updatedPositions.add(pos);
                    modified = true;
                  }
                }
              });
            }
          });

          if (modified) {
            tr.setMeta("isMetadataUpdate", true);
            return tr;
          }
        },
      }),
    ];
  },
});
