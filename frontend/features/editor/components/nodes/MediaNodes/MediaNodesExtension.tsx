import React, { useState, useEffect } from "react";
import { Node as TiptapNode, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import {
  Accordion as ShadcnAccordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useDecryptedMedia } from "@/hooks/use-decrypted-media";

export function AudioNodeView({ node }: any) {
  const decryptedSrc = useDecryptedMedia(node.attrs.src);
  return (
    <NodeViewWrapper className="my-4 w-full">
      <audio
        controls
        className="w-full rounded-md max-w-md"
        src={decryptedSrc || node.attrs.src}
      />
    </NodeViewWrapper>
  );
}

export function VideoNodeView({ node }: any) {
  const decryptedSrc = useDecryptedMedia(node.attrs.src);
  return (
    <NodeViewWrapper className="my-4 w-full aspect-video">
      <video
        controls
        className="w-full h-full rounded-md shadow-sm"
        src={decryptedSrc || node.attrs.src}
      />
    </NodeViewWrapper>
  );
}

export const Iframe = TiptapNode.create({
  name: "iframe",
  group: "block",
  atom: true,

  addOptions() {
    return {
      allowFullscreen: true,
      HTMLAttributes: {
        class:
          "w-full rounded-md shadow-sm outline-none border-0 aspect-video my-4",
      },
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      frameborder: {
        default: 0,
      },
      allowfullscreen: {
        default: this.options.allowFullscreen,
        parseHTML: () => this.options.allowFullscreen,
      },
      width: {
        default: "100%",
      },
      height: {
        default: "100%",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "iframe",
      },
    ];
  },

  renderHTML({ HTMLAttributes }: any) {
    return [
      "div",
      { class: "relative w-full aspect-video my-4" },
      ["iframe", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)],
    ];
  },

  addCommands() {
    return {
      setIframe:
        (options: { src: string }) =>
        ({ tr, dispatch }: any) => {
          const { selection } = tr;
          const node = this.type.create(options);
          if (dispatch) {
            tr.replaceRangeWith(selection.from, selection.to, node);
          }
          return true;
        },
    } as any;
  },
});

export const AudioNode = TiptapNode.create({
  name: "audio",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "audio" }];
  },

  renderHTML({ HTMLAttributes }: any) {
    return [
      "div",
      { "data-type": "audio-node" },
      mergeAttributes(HTMLAttributes),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AudioNodeView);
  },

  addCommands() {
    return {
      setAudio:
        (options: { src: string }) =>
        ({ tr, dispatch }: any) => {
          const { selection } = tr;
          const node = this.type.create(options);
          if (dispatch) {
            tr.replaceRangeWith(selection.from, selection.to, node);
          }
          return true;
        },
    } as any;
  },
});

export const VideoNode = TiptapNode.create({
  name: "video",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "video" }];
  },

  renderHTML({ HTMLAttributes }: any) {
    return [
      "div",
      { "data-type": "video-node" },
      mergeAttributes(HTMLAttributes),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoNodeView);
  },

  addCommands() {
    return {
      setVideo:
        (options: { src: string }) =>
        ({ tr, dispatch }: any) => {
          const { selection } = tr;
          const node = this.type.create(options);
          if (dispatch) {
            tr.replaceRangeWith(selection.from, selection.to, node);
          }
          return true;
        },
    } as any;
  },
});

export const FileNode = TiptapNode.create({
  name: "fileAttachment",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      filename: { default: "Attachment" },
      filetype: { default: "FILE" },
      isOpen: { default: true },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-type='file-attachment']" }];
  },

  renderHTML({ HTMLAttributes }: any) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "file-attachment",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileNodeView);
  },

  addCommands() {
    return {
      setFile:
        (options: { src: string; filename: string; filetype: string }) =>
        ({ tr, dispatch }: any) => {
          const { selection } = tr;
          const node = this.type.create({ ...options, isOpen: true });
          if (dispatch) {
            tr.replaceRangeWith(selection.from, selection.to, node);
          }
          return true;
        },
    } as any;
  },
});

export function FileNodeView({ node, updateAttributes }: any) {
  const { src, filename, filetype, isOpen } = node.attrs;
  const fType = (filetype || "").toLowerCase();

  const isTextFile = ["json", "csv", "txt"].includes(fType);
  const isPdf = fType === "pdf";
  const isWord = ["doc", "docx"].includes(fType);
  const isEmbeddable = isTextFile || isPdf || isWord;

  const [fileContent, setFileContent] = useState<string | null>(null);
  const decryptedSrc = useDecryptedMedia(src);

  useEffect(() => {
    if (isTextFile && decryptedSrc) {
      fetch(decryptedSrc)
        .then((r) => r.text())
        .then((text) => setFileContent(text))
        .catch(() => setFileContent("Failed to load file content."));
    }
  }, [isTextFile, decryptedSrc]);

  if (!isEmbeddable) {
    return (
      <NodeViewWrapper as="div" className="my-4">
        <div className="flex items-center justify-between p-3 border rounded-lg bg-card text-card-foreground shadow-sm hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-muted rounded-md text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate" title={filename}>
                {filename || "Attachment"}
              </p>
              <p className="text-xs text-muted-foreground uppercase">
                {filetype || "FILE"}
              </p>
            </div>
          </div>
          <a
            href={decryptedSrc || src}
            download={filename}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 h-8 px-3 inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 rounded-md"
          >
            Download
          </a>
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="w-full my-4 not-prose">
      <ShadcnAccordion
        type="multiple"
        value={isOpen ? ["item-1"] : []}
        onValueChange={(v: any) =>
          updateAttributes({ isOpen: v.includes("item-1") })
        }
        className="w-full border rounded-md bg-card"
      >
        <AccordionItem value="item-1" className="border-0">
          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3 text-left">
              <span className="flex items-center justify-center w-8 h-8 bg-background border rounded-md text-muted-foreground shadow-sm shrink-0 text-xs text-center">
                📄
              </span>
              <div className="flex flex-col items-start min-w-0">
                <span className="text-sm font-medium text-foreground truncate">
                  {filename}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase">
                  {filetype}
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-0 border-t border-border">
            {isPdf ? (
              <div className="w-full aspect-[1/1.4] max-h-[800px] bg-muted/20">
                <iframe
                  src={decryptedSrc || src}
                  className="w-full h-full border-0"
                  title={filename}
                />
              </div>
            ) : isWord ? (
              <div className="w-full aspect-[1/1.4] max-h-[800px] bg-muted/20">
                <iframe
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(decryptedSrc || src)}`}
                  className="w-full h-full border-0"
                  title={filename}
                />
              </div>
            ) : (
              <div className="w-full max-h-[500px] overflow-auto p-4 bg-muted/20">
                <pre className="text-[11px] leading-relaxed font-mono text-foreground m-0 p-0 !bg-transparent w-full whitespace-pre-wrap">
                  {fileContent === null ? "Loading content..." : fileContent}
                </pre>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </ShadcnAccordion>
    </NodeViewWrapper>
  );
}
