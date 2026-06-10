"use client";

import { useRef } from "react";
import Image from "@tiptap/extension-image";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import {
  buildTiptapImageStyle,
  parseTiptapImageAlign,
  parseTiptapImageWidth,
} from "@/utils/tiptapImageUtils";

const ALIGN_WRAPPER_CLASS = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

function ResizableImageView({ node, updateAttributes, selected }) {
  const imgRef = useRef(null);
  const width = node.attrs.width;
  const align = node.attrs.align || "left";

  const startResize = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const img = imgRef.current;
    if (!img) return;

    const startX = event.clientX;
    const startWidth = img.offsetWidth;

    const onMove = (moveEvent) => {
      const delta = moveEvent.clientX - startX;
      const nextWidth = Math.max(80, Math.min(1200, startWidth + delta));
      updateAttributes({ width: nextWidth });
    };

    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  return (
    <NodeViewWrapper
      as="div"
      className={`tiptap-image-node relative flex w-full my-2 ${ALIGN_WRAPPER_CLASS[align] || ALIGN_WRAPPER_CLASS.left}`}
      data-align={align}
      data-drag-handle
    >
      <div className="relative inline-block max-w-full align-middle">
        <img
          ref={imgRef}
          src={node.attrs.src}
          alt={node.attrs.alt || ""}
          draggable={false}
          data-align={align}
          style={{
            width: width ? `${width}px` : undefined,
            maxWidth: "100%",
            height: "auto",
            display: "block",
          }}
          className={`rounded ${selected ? "ring-2 ring-[#1A73E8] ring-offset-1" : ""}`}
        />
        {selected ? (
          <span
            role="presentation"
            onMouseDown={startResize}
            className="absolute bottom-0.5 right-0.5 z-10 h-3.5 w-3.5 cursor-se-resize rounded-sm border-2 border-white bg-[#1A73E8] shadow"
            title="Drag to resize"
          />
        ) : null}
      </div>
    </NodeViewWrapper>
  );
}

export const ResizableImage = Image.extend({
  name: "image",

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => parseTiptapImageWidth(element),
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return { width: attributes.width };
        },
      },
      align: {
        default: "left",
        parseHTML: (element) => parseTiptapImageAlign(element),
        renderHTML: (attributes) => {
          const align = attributes.align || "left";
          return { "data-align": align };
        },
      },
      alt: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "img[src]",
        getAttrs: (element) => ({
          src: element.getAttribute("src"),
          alt: element.getAttribute("alt"),
          width: parseTiptapImageWidth(element),
          align: parseTiptapImageAlign(element),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const width = HTMLAttributes.width
      ? parseInt(HTMLAttributes.width, 10)
      : null;
    const align = HTMLAttributes["data-align"] || "left";
    const {
      width: _widthAttr,
      "data-align": _alignAttr,
      style: _style,
      ...rest
    } = HTMLAttributes;

    return [
      "img",
      {
        ...rest,
        "data-align": align,
        style: buildTiptapImageStyle(
          Number.isFinite(width) ? width : null,
          align
        ),
        ...(Number.isFinite(width) ? { width } : {}),
      },
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});
