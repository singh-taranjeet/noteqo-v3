import type { Editor } from "@tiptap/react";

const FILE_UPLOADER_EXTENSION_NAME = "fileUploader" as const;

/**
 * Resolves the spaceId for a media node.
 * First checks the node's own attributes, then falls back to the
 * fileUploader extension's configured getter.
 */
export function resolveSpaceId(
  editor: Editor,
  nodeSpaceId: string | undefined | null,
): string | undefined {
  if (nodeSpaceId) return nodeSpaceId;

  const fileUploaderExt = editor.extensionManager.extensions.find(
    (e) => e.name === FILE_UPLOADER_EXTENSION_NAME,
  );

  return fileUploaderExt?.options.getSpaceId?.() as string | undefined;
}
