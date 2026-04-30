import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { mediaService } from "@/features/media";
import { logService } from "@/services/log.service";

export interface FileUploaderOptions {
  /**
   * Function to get the current spaceId
   */
  getSpaceId: () => string | null;
  /**
   * Function to get the current noteId
   */
  getNoteId: () => string | null;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fileUploader: {
      promptFileUpload: (accept?: string) => ReturnType;
    };
  }
}

export const FileUploaderExtension = Extension.create<FileUploaderOptions>({
  name: "fileUploader",

  addOptions() {
    return {
      getSpaceId: () => null,
      getNoteId: () => null,
    };
  },

  addStorage() {
    return {
      handleUpload: () => {},
      getSpaceId: () => null as string | null,
    };
  },

  onBeforeCreate() {
    this.storage.getSpaceId = this.options.getSpaceId;
  },

  addProseMirrorPlugins() {
    const { getSpaceId, getNoteId } = this.options;
    const editor = this.editor;

    const handleUpload = async (file: File, pos: number) => {
      const spaceId = getSpaceId();
      const noteId = getNoteId();

      if (!spaceId || !noteId) {
        logService.error("Missing spaceId or noteId for file upload");
        return;
      }

      const isImage = file.type.startsWith("image/");
      const nodeType = isImage ? "encryptedImage" : "fileAttachment";

      // 1. Insert a placeholder attachment node with `uploading: true`
      editor
        .chain()
        .focus()
        .insertContentAt(pos, {
          type: nodeType,
          attrs: {
            fileName: file.name,
            mimeType: file.type,
            sizeBytes: file.size,
            uploading: true,
            spaceId: spaceId,
          },
        })
        .run();

      // Find the node we just inserted to update it later
      // Since `insertContentAt` might shift pos depending on document structure,
      // a more robust approach is to find it via its `fileName` and `uploading: true`

      try {
        const response = await mediaService.uploadMedia(file, spaceId, noteId);

        // 2. Find the node and update its attributes with the real URL
        editor.view.state.doc.descendants((node, pos) => {
          if (
            node.type.name === nodeType &&
            node.attrs.uploading === true &&
            node.attrs.fileName === file.name
          ) {
            editor.commands.command(({ tr }) => {
              // Aggressively extract URL and ID to bypass any HMR caching issues without using any
              const rawResp = response as unknown as Record<string, unknown>;
              const respData = rawResp.data as
                | Record<string, unknown>
                | undefined;
              const respDataData = respData?.data as
                | Record<string, unknown>
                | undefined;

              const finalUrl =
                (rawResp.url as string | undefined) ||
                (respData?.url as string | undefined) ||
                (respDataData?.url as string | undefined);

              const finalId =
                (rawResp.id as string | undefined) ||
                (respData?.id as string | undefined) ||
                (respDataData?.id as string | undefined);

              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                url: finalUrl,
                mediaId: finalId,
                uploading: false,
              });
              return true;
            });
            return false; // Stop descending
          }
          return true;
        });
      } catch (error) {
        logService.error("Failed to upload file", error);
        editor.view.state.doc.descendants((node, pos) => {
          if (
            node.type.name === nodeType &&
            node.attrs.uploading === true &&
            node.attrs.fileName === file.name
          ) {
            editor.commands.command(({ tr }) => {
              tr.delete(pos, pos + node.nodeSize);
              return true;
            });
            return false;
          }
          return true;
        });
      }
    };

    this.storage.handleUpload = handleUpload;

    return [
      new Plugin({
        key: new PluginKey("fileUploader"),
        props: {
          handlePaste(view, event, _slice) {
            const items = Array.from(event.clipboardData?.items || []);
            const files = items
              .filter((item) => item.kind === "file")
              .map((item) => item.getAsFile())
              .filter((f): f is File => f !== null);

            if (files.length === 0) return false;

            event.preventDefault();
            const pos = view.state.selection.from;

            files.forEach((file) => {
              void handleUpload(file, pos);
            });

            return true;
          },
          handleDrop(view, event, _slice, moved) {
            if (moved) return false;

            const files = Array.from(event.dataTransfer?.files || []);
            if (files.length === 0) return false;

            event.preventDefault();
            const coordinates = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            });
            const pos = coordinates?.pos ?? view.state.selection.from;

            files.forEach((file) => {
              void handleUpload(file, pos);
            });

            return true;
          },
        },
      }),
    ];
  },

  addCommands() {
    return {
      promptFileUpload:
        (accept?: string) =>
        ({ editor }) => {
          const input = document.createElement("input");
          input.type = "file";
          if (accept) {
            input.accept = accept;
          }
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              const pos = editor.state.selection.from;
              // We dispatch a custom event to trigger the paste handler, or just invoke handleUpload directly.
              interface FileUploaderStorage {
                handleUpload: (file: File, pos: number) => void;
              }
              const storage = editor.storage as unknown as Record<
                string,
                unknown
              >;
              const fileUploaderStorage = storage.fileUploader as
                | FileUploaderStorage
                | undefined;
              fileUploaderStorage?.handleUpload(file, pos);
            }
          };
          input.click();
          return true;
        },
    };
  },
});
