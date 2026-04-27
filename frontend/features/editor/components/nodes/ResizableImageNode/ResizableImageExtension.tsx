import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import React, { useState, useRef, useEffect } from "react";
import { AlignLeft, AlignCenter, AlignRight, Maximize2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useDecryptedMedia } from "@/hooks/use-decrypted-media";

const ResizableImageNodeView = (props: any) => {
  const { node, updateAttributes, selected } = props;
  const imageRef = useRef<HTMLImageElement>(null);
  const [resizing, setResizing] = useState(false);
  const [initialWidth, setInitialWidth] = useState(0);
  const [initialMouseX, setInitialMouseX] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const decryptedSrc = useDecryptedMedia(node.attrs.src);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setResizing(true);
    setInitialMouseX(e.clientX);
    if (imageRef.current) {
      setInitialWidth(imageRef.current.clientWidth);
    }
  };

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - initialMouseX;
      let newWidth = initialWidth + deltaX;
      if (newWidth < 100) newWidth = 100; // Minimum width
      updateAttributes({ width: newWidth });
    };

    const handleMouseUp = () => setResizing(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizing, initialMouseX, initialWidth, updateAttributes]);

  const alignment = node.attrs.alignment || "center";

  const widthStyle = typeof node.attrs.width === 'number' ? `${node.attrs.width}px` : node.attrs.width;

  return (
    <NodeViewWrapper
      draggable="true"
      data-drag-handle="true"
      className={`relative flex my-6 !leading-none ${
        alignment === "left"
          ? "justify-start"
          : alignment === "right"
          ? "justify-end"
          : "justify-center"
      }`}
    >
      <div 
        className={`relative group inline-block rounded-md ${selected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
        style={{ width: widthStyle }}
      >
        <img
          ref={imageRef}
          src={decryptedSrc || node.attrs.src}
          alt={node.attrs.alt}
          className={`block max-w-full rounded-md object-contain ${resizing ? 'cursor-ew-resize' : 'cursor-default'} ${selected ? 'opacity-95' : ''}`}
          style={{ width: "100%", height: "auto" }}
        />

        {selected && (
          <>
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-background border shadow-sm rounded-md p-1 z-50">
              <button
                type="button"
                className={`p-1.5 rounded-sm hover:bg-muted ${alignment === "left" ? "bg-muted text-primary" : "text-muted-foreground"}`}
                onClick={() => updateAttributes({ alignment: "left" })}
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                className={`p-1.5 rounded-sm hover:bg-muted ${alignment === "center" ? "bg-muted text-primary" : "text-muted-foreground"}`}
                onClick={() => updateAttributes({ alignment: "center" })}
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                type="button"
                className={`p-1.5 rounded-sm hover:bg-muted ${alignment === "right" ? "bg-muted text-primary" : "text-muted-foreground"}`}
                onClick={() => updateAttributes({ alignment: "right" })}
              >
                <AlignRight className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-border/60 mx-0.5" />
              <button
                type="button"
                className="p-1.5 rounded-sm hover:bg-muted text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setIsFullscreen(true)}
                title="View Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            <div
              className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-primary shadow-sm border-2 border-background rounded-full cursor-se-resize z-50 opacity-100 transition-transform hover:scale-110"
              onMouseDown={handleMouseDown}
            />
          </>
        )}
      </div>

      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="!max-w-none w-screen h-screen m-0 p-0 border-none bg-black shadow-none flex flex-col items-center justify-center [&>button]:text-white z-[100] [&>button]:bg-black/50 [&>button]:p-2 [&>button]:rounded-full [&>button]:right-4 [&>button]:top-4 [&>button]:w-10 [&>button]:h-10">
          <img 
            src={decryptedSrc || node.attrs.src} 
            alt={node.attrs.alt || 'Fullscreen Preview'} 
            className="w-full h-full object-contain pointer-events-none" 
          />
        </DialogContent>
      </Dialog>
    </NodeViewWrapper>
  );
};

export const ResizableImage = Node.create({
  name: "image",

  inline: false,
  group: "block",
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      width: { default: "100%" },
      alignment: { default: "center" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "img[src]",
        getAttrs: (node) => {
          if (typeof node === 'string') return {};
          const w = node.getAttribute("data-width") || node.style?.width;
          const a = node.getAttribute("data-alignment");
          
          return {
            width: w && !isNaN(Number(w)) ? Number(w) : w || "100%",
            alignment: a || "center"
          };
        }
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { width, alignment, "data-width": dw, "data-alignment": da, ...rest } = HTMLAttributes;
    
    let alignStyles = "display: flex; justify-content: center;";
    if (alignment === "left") alignStyles = "display: flex; justify-content: flex-start;";
    if (alignment === "right") alignStyles = "display: flex; justify-content: flex-end;";

    return [
      "div",
      { style: alignStyles, class: "resizable-image-wrapper" },
      ["img", mergeAttributes(rest, { 
        style: `width: ${width}${typeof width === 'number' ? 'px' : ''}; height: auto; max-width: 100%;`,
        "data-width": width,
        "data-alignment": alignment
      })],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageNodeView);
  },
});
