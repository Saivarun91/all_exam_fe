"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import FontFamily from "@tiptap/extension-font-family";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useState, useRef } from "react";

// Import extensions as named exports (Turbopack compatible)
import { TextStyle } from "@tiptap/extension-text-style";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Highlighter,
  Type,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

// Custom Bullet List Extension with Style Support
const CustomBulletList = BulletList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      listStyleType: {
        default: "disc",
        parseHTML: (element) => element.getAttribute("data-list-style") || element.style.listStyleType || "disc",
        renderHTML: (attributes) => {
          if (!attributes.listStyleType || attributes.listStyleType === "disc") {
            return {};
          }
          return {
            "data-list-style": attributes.listStyleType,
            style: attributes.listStyleType === "disc" || attributes.listStyleType === "circle" || attributes.listStyleType === "square"
              ? `list-style-type: ${attributes.listStyleType}`
              : "list-style-type: none",
          };
        },
      },
    };
  },
});

// Custom Ordered List Extension with Style Support
const CustomOrderedList = OrderedList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      listStyleType: {
        default: "decimal",
        parseHTML: (element) => element.getAttribute("data-list-style") || element.style.listStyleType || "decimal",
        renderHTML: (attributes) => {
          if (!attributes.listStyleType || attributes.listStyleType === "decimal") {
            return {};
          }
          return {
            "data-list-style": attributes.listStyleType,
            style: `list-style-type: ${attributes.listStyleType}`,
          };
        },
      },
    };
  },
});

// Custom Font Size Extension
const FontSize = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (element) => {
          const fontSize = element.style.fontSize;
          if (fontSize) {
            return fontSize.replace("px", "");
          }
          return null;
        },
        renderHTML: (attributes) => {
          if (!attributes.fontSize) {
            return {};
          }
          return {
            style: `font-size: ${attributes.fontSize}px`,
          };
        },
      },
    };
  },
  addCommands() {
    return {
      ...this.parent?.(),
      setFontSize: (fontSize) => ({ chain, state }) => {
        return chain()
          .setMark(this.name, { fontSize: String(fontSize) })
          .run();
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark(this.name, { fontSize: null })
          .removeEmptyTextStyle()
          .run();
      },
    };
  },
});

// Helper function to generate gradient CSS
const getGradientCSS = (direction, color1, color2, color3 = null) => {
  const directions = {
    right: "to right",
    left: "to left",
    down: "to bottom",
    up: "to top",
    "diagonal-down": "to bottom right",
    "diagonal-up": "to top right",
    radial: "radial-gradient(circle,"
  };

  if (direction === "radial") {
    if (color3) {
      return `radial-gradient(circle, ${color1}, ${color2}, ${color3})`;
    }
    return `radial-gradient(circle, ${color1}, ${color2})`;
  }

  const dir = directions[direction] || "to right";
  if (color3) {
    return `linear-gradient(${dir}, ${color1}, ${color2}, ${color3})`;
  }
  return `linear-gradient(${dir}, ${color1}, ${color2})`;
};

const TipTapEditor = ({ 
  content = "", 
  onChange = () => {}, 
  placeholder = "Start typing...",
  className = "" 
}) => {
  const [textColorOpen, setTextColorOpen] = useState(false);
  const [highlightColorOpen, setHighlightColorOpen] = useState(false);
  const [textColor, setTextColor] = useState("#000000");
  const [highlightColor, setHighlightColor] = useState("#ffff00");
  const [showGradient, setShowGradient] = useState(false);
  const [gradientDirection, setGradientDirection] = useState("right");
  const [gradientColor1, setGradientColor1] = useState("#FF512F");
  const [gradientColor2, setGradientColor2] = useState("#DD2476");
  const [gradientColor3, setGradientColor3] = useState("");
  const [useThirdColor, setUseThirdColor] = useState(false);
  const [highlightGradientColor1, setHighlightGradientColor1] = useState("#FFFF00");
  const [highlightGradientColor2, setHighlightGradientColor2] = useState("#FFD700");
  const [highlightGradientColor3, setHighlightGradientColor3] = useState("");
  const [useHighlightThirdColor, setUseHighlightThirdColor] = useState(false);
  const [highlightGradientDirection, setHighlightGradientDirection] = useState("right");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      ListItem,
      CustomBulletList.configure({
        keepMarks: true,
        keepAttributes: true,
      }),
      CustomOrderedList.configure({
        keepMarks: true,
        keepAttributes: true,
      }),
      Underline,
      Subscript,
      Superscript,
      Highlight.configure({
        multicolor: true,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      FontFamily.configure({
        types: ["textStyle"],
      }),
      FontSize,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Color,
      TextStyle,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder,
      }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: "tiptap-editor-content focus:outline-none min-h-[300px] p-4",
        style: "font-family: Calibri, sans-serif; font-size: 11px;",
      },
      handlePaste(view, event) {
        // Get the clipboard data as plain text
        const clipboardData = event.clipboardData || window.clipboardData;
        const pastedText = clipboardData.getData('text/plain');
        
        // Check if we're in a list context (bulletList or orderedList)
        const { $from } = view.state.selection;
        let isInList = false;
        let listItemDepth = -1;
        
        // Check parent nodes for list
        for (let depth = $from.depth; depth > 0; depth--) {
          const node = $from.node(depth);
          if (node.type.name === 'listItem') {
            listItemDepth = depth;
          }
          if (node.type.name === 'bulletList' || node.type.name === 'orderedList') {
            isInList = true;
            break;
          }
        }
        
        // If we have multi-line text and we're in a list, split into multiple list items
        if (pastedText && pastedText.includes('\n') && isInList && listItemDepth > 0) {
          event.preventDefault();
          
          const lines = pastedText.split(/\r?\n/).filter(line => line.trim().length > 0);
          
          if (lines.length > 1) {
            const { tr, schema } = view.state;
            const { from, to } = view.state.selection;
            
            // Delete the current selection first
            if (from !== to) {
              tr.delete(from, to);
            }
            
            const insertPos = tr.selection.from;
            const $pos = tr.doc.resolve(insertPos);
            
            // Find the paragraph node inside the list item
            let paragraphStart = insertPos;
            let paragraphEnd = insertPos;
            let paragraphDepth = listItemDepth + 1;
            
            // Find the paragraph boundaries
            for (let depth = $pos.depth; depth > listItemDepth; depth--) {
              const node = $pos.node(depth);
              if (node.type.name === 'paragraph') {
                paragraphStart = $pos.start(depth);
                paragraphEnd = $pos.end(depth);
                paragraphDepth = depth;
                break;
              }
            }
            
            // Replace current paragraph content with first line
            const firstParagraph = schema.nodes.paragraph.create({}, schema.text(lines[0].trim()));
            tr.replaceWith(paragraphStart, paragraphEnd, firstParagraph);
            
            // Get list item end position for inserting new items
            const listItemEnd = $pos.end(listItemDepth);
            
            // Insert remaining lines as new list items after current one
            let currentPos = listItemEnd;
            for (let i = 1; i < lines.length; i++) {
              if (lines[i].trim()) {
                const paragraph = schema.nodes.paragraph.create({}, schema.text(lines[i].trim()));
                const listItem = schema.nodes.listItem.create({}, paragraph);
                tr.insert(currentPos, listItem);
                currentPos += listItem.nodeSize;
              }
            }
            
            // Set selection to end of last inserted item
            const newPos = currentPos - 2; // Position before the last node's end
            tr.setSelection(tr.doc.resolve(Math.max(0, newPos)));
            
            view.dispatch(tr);
            return true;
          }
        }
        
        // Default behavior for other cases
        return false;
      },
      transformPastedHTML(html) {
        // Ensure pasted content maintains font styling
        return html;
      },
    },
  });

  useEffect(() => {
    if (editor && content !== undefined) {
      const currentContent = editor.getHTML();
      // Normalize empty content for comparison
      const normalizedCurrent = currentContent.trim() === "<p></p>" ? "" : currentContent;
      const normalizedNew = content || "";
      
      // Only update if content actually changed (avoid infinite loops)
      if (normalizedCurrent !== normalizedNew) {
        // If content is empty, set empty string so placeholder shows
        editor.commands.setContent(normalizedNew, false);
      }
    }
  }, [content, editor]);

  // Update color state when editor selection changes
  useEffect(() => {
    if (editor) {
      const updateColors = () => {
        const currentTextColor = editor.getAttributes("textStyle").color || "#000000";
        setTextColor(currentTextColor);
        
        // Check for highlight color in selection
        const { from, to } = editor.state.selection;
        let foundHighlightColor = "#ffff00";
        editor.state.doc.nodesBetween(from, to, (node) => {
          if (node.marks) {
            node.marks.forEach((mark) => {
              if (mark.type.name === "highlight" && mark.attrs.color) {
                foundHighlightColor = mark.attrs.color;
              }
            });
          }
        });
        setHighlightColor(foundHighlightColor);
      };
      
      editor.on("selectionUpdate", updateColors);
      editor.on("update", updateColors);
      updateColors();
      
      return () => {
        editor.off("selectionUpdate", updateColors);
        editor.off("update", updateColors);
      };
    }
  }, [editor]);

  if (!editor) {
    return (
      <div className={`border border-gray-300 rounded-lg bg-white ${className}`}>
        <div className="p-4 min-h-[300px] flex items-center justify-center">
          <div className="text-gray-400">Loading editor...</div>
        </div>
      </div>
    );
  }


  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const getCurrentFontSize = () => {
    if (!editor) return "11";
    try {
      const attrs = editor.getAttributes("textStyle");
      if (attrs && attrs.fontSize) {
        return String(attrs.fontSize);
      }
      // Check marks in selection
      const { from, to } = editor.state.selection;
      let fontSize = "11";
      editor.state.doc.nodesBetween(Math.max(0, from - 1), Math.min(editor.state.doc.content.size, to + 1), (node, pos) => {
        if (node.marks && node.marks.length > 0) {
          node.marks.forEach((mark) => {
            if (mark.type.name === "textStyle" && mark.attrs && mark.attrs.fontSize) {
              fontSize = String(mark.attrs.fontSize);
            }
          });
        }
      });
      return fontSize;
    } catch (error) {
      return "11";
    }
  };

  const getCurrentFontFamily = () => {
    if (!editor) return "Calibri";
    const attrs = editor.getAttributes("textStyle");
    // Check if there's a font family in the current selection
    if (attrs.fontFamily) {
      return attrs.fontFamily;
    }
    // Check the current node's style
    const { from, to } = editor.state.selection;
    let fontFamily = "Calibri";
    editor.state.doc.nodesBetween(from, to, (node) => {
      if (node.marks) {
        node.marks.forEach((mark) => {
          if (mark.type.name === "textStyle" && mark.attrs.fontFamily) {
            fontFamily = mark.attrs.fontFamily;
          }
        });
      }
    });
    return fontFamily;
  };

  const getCurrentListStyle = () => {
    if (!editor) return "disc";
    try {
      const { from } = editor.state.selection;
      const $from = editor.state.doc.resolve(from);
      let listStyle = "disc";
      
      // Check parent nodes for bullet list
      for (let depth = $from.depth; depth > 0; depth--) {
        const node = $from.node(depth);
        if (node.type.name === "bulletList") {
          listStyle = node.attrs.listStyleType || "disc";
          break;
        }
      }
      
      return listStyle;
    } catch (error) {
      return "disc";
    }
  };

  const getCurrentOrderedListStyle = () => {
    if (!editor) return "decimal";
    try {
      const { from } = editor.state.selection;
      const $from = editor.state.doc.resolve(from);
      let listStyle = "decimal";
      
      // Check parent nodes for ordered list
      for (let depth = $from.depth; depth > 0; depth--) {
        const node = $from.node(depth);
        if (node.type.name === "orderedList") {
          listStyle = node.attrs.listStyleType || "decimal";
          break;
        }
      }
      
      return listStyle;
    } catch (error) {
      return "decimal";
    }
  };

  const applyListStyle = (style) => {
    if (!editor) return;
    
    editor.chain().focus().command(({ tr, state }) => {
      const { from } = state.selection;
      const $from = state.doc.resolve(from);
      const nodes = [];
      
      // Find bullet list nodes by checking parent nodes
      for (let depth = $from.depth; depth > 0; depth--) {
        const node = $from.node(depth);
        if (node.type.name === "bulletList") {
          const pos = $from.before(depth);
          nodes.push({ node, pos });
          break;
        }
      }
      
      // Also check all bullet lists in document if selection is in a list
      if (nodes.length === 0) {
        state.doc.nodesBetween(0, state.doc.content.size, (node, pos) => {
          if (node.type.name === "bulletList") {
            // Check if selection is within this list
            const listEnd = pos + node.nodeSize;
            if (from >= pos && from <= listEnd) {
              nodes.push({ node, pos });
            }
          }
        });
      }
      
      // Update all found list nodes
      nodes.forEach(({ node, pos }) => {
        const attrs = { ...node.attrs };
        attrs.listStyleType = style;
        tr.setNodeMarkup(pos, null, attrs);
      });
      
      return true;
    }).run();
  };

  const applyOrderedListStyle = (style) => {
    if (!editor) return;
    
    editor.chain().focus().command(({ tr, state }) => {
      const { from } = state.selection;
      const $from = state.doc.resolve(from);
      const nodes = [];
      
      // Find ordered list nodes by checking parent nodes
      for (let depth = $from.depth; depth > 0; depth--) {
        const node = $from.node(depth);
        if (node.type.name === "orderedList") {
          const pos = $from.before(depth);
          nodes.push({ node, pos });
          break;
        }
      }
      
      // Also check all ordered lists in document if selection is in a list
      if (nodes.length === 0) {
        state.doc.nodesBetween(0, state.doc.content.size, (node, pos) => {
          if (node.type.name === "orderedList") {
            // Check if selection is within this list
            const listEnd = pos + node.nodeSize;
            if (from >= pos && from <= listEnd) {
              nodes.push({ node, pos });
            }
          }
        });
      }
      
      // Update all found list nodes
      nodes.forEach(({ node, pos }) => {
        const attrs = { ...node.attrs };
        attrs.listStyleType = style;
        tr.setNodeMarkup(pos, null, attrs);
      });
      
      return true;
    }).run();
  };

  return (
    <div className={`border border-gray-300 rounded-lg bg-white ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-300 p-2 flex flex-wrap items-center gap-1 bg-gray-50">
        {/* Undo/Redo */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="h-8 w-8 p-0"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="h-8 w-8 p-0"
        >
          <Redo className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Font Family */}
        <Select
          value={getCurrentFontFamily()}
          onValueChange={(value) => {
            editor.chain().focus().setFontFamily(value).run();
          }}
        >
          <SelectTrigger className="h-8 w-[140px] text-xs" style={{ fontFamily: getCurrentFontFamily() }}>
            <SelectValue>
              {getCurrentFontFamily() === "Poppins" ? "Poppins (Website)" : getCurrentFontFamily()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[300px] overflow-y-auto">
            <SelectItem value="Poppins" style={{ fontFamily: "Poppins, sans-serif" }}>
              <div className="flex items-center justify-between w-full">
                <span style={{ fontFamily: "Poppins, sans-serif" }}>Poppins</span>
                <span className="text-xs text-blue-600 font-semibold ml-auto">(Website Font)</span>
              </div>
            </SelectItem>
            <SelectItem value="Calibri" style={{ fontFamily: "Calibri" }}>
              <div className="flex items-center justify-between w-full">
                <span style={{ fontFamily: "Calibri" }}>Calibri</span>
                <span className="text-xs text-blue-600 font-semibold ml-auto">(Editor Default)</span>
              </div>
            </SelectItem>
            <SelectItem value="Arial" style={{ fontFamily: "Arial" }}>Arial</SelectItem>
            <SelectItem value="Times New Roman" style={{ fontFamily: "Times New Roman" }}>Times New Roman</SelectItem>
            <SelectItem value="Courier New" style={{ fontFamily: "Courier New" }}>Courier New</SelectItem>
            <SelectItem value="Verdana" style={{ fontFamily: "Verdana" }}>Verdana</SelectItem>
            <SelectItem value="Georgia" style={{ fontFamily: "Georgia" }}>Georgia</SelectItem>
            <SelectItem value="Comic Sans MS" style={{ fontFamily: "Comic Sans MS" }}>Comic Sans MS</SelectItem>
            <SelectItem value="Trebuchet MS" style={{ fontFamily: "Trebuchet MS" }}>Trebuchet MS</SelectItem>
            <SelectItem value="Helvetica" style={{ fontFamily: "Helvetica" }}>Helvetica</SelectItem>
            <SelectItem value="Tahoma" style={{ fontFamily: "Tahoma" }}>Tahoma</SelectItem>
            <SelectItem value="Impact" style={{ fontFamily: "Impact" }}>Impact</SelectItem>
            <SelectItem value="Lucida Console" style={{ fontFamily: "Lucida Console" }}>Lucida Console</SelectItem>
            <SelectItem value="Palatino" style={{ fontFamily: "Palatino" }}>Palatino</SelectItem>
            <SelectItem value="Garamond" style={{ fontFamily: "Garamond" }}>Garamond</SelectItem>
            <SelectItem value="Book Antiqua" style={{ fontFamily: "Book Antiqua" }}>Book Antiqua</SelectItem>
            <SelectItem value="Arial Black" style={{ fontFamily: "Arial Black" }}>Arial Black</SelectItem>
            <SelectItem value="Century Gothic" style={{ fontFamily: "Century Gothic" }}>Century Gothic</SelectItem>
            <SelectItem value="Franklin Gothic Medium" style={{ fontFamily: "Franklin Gothic Medium" }}>Franklin Gothic Medium</SelectItem>
            <SelectItem value="Lucida Sans Unicode" style={{ fontFamily: "Lucida Sans Unicode" }}>Lucida Sans Unicode</SelectItem>
            <SelectItem value="MS Sans Serif" style={{ fontFamily: "MS Sans Serif" }}>MS Sans Serif</SelectItem>
            <SelectItem value="MS Serif" style={{ fontFamily: "MS Serif" }}>MS Serif</SelectItem>
            <SelectItem value="Symbol" style={{ fontFamily: "Symbol" }}>Symbol</SelectItem>
            <SelectItem value="Wingdings" style={{ fontFamily: "Wingdings" }}>Wingdings</SelectItem>
          </SelectContent>
        </Select>

        {/* Font Size */}
        <Select
          value={getCurrentFontSize()}
          onValueChange={(value) => {
            if (value) {
              editor.chain().focus().setFontSize(value).run();
            }
          }}
        >
          <SelectTrigger className="h-8 w-[70px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72].map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Text Formatting */}
        <Button
          type="button"
          variant={editor.isActive("bold") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="h-8 w-8 p-0 font-bold"
        >
          B
        </Button>
        <Button
          type="button"
          variant={editor.isActive("italic") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="h-8 w-8 p-0 italic"
        >
          I
        </Button>
        <Button
          type="button"
          variant={editor.isActive("underline") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className="h-8 w-8 p-0"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("strike") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className="h-8 w-8 p-0"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("subscript") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          className="h-8 w-8 p-0"
        >
          <SubscriptIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("superscript") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          className="h-8 w-8 p-0"
        >
          <SuperscriptIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Text Color - Icon Button with Popover */}
        <Popover open={textColorOpen} onOpenChange={setTextColorOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 relative group"
              title="Text Color"
            >
              <Type className="h-4 w-4" />
              <div 
                className="absolute bottom-0 left-0 right-0 h-1 rounded-b border-t"
                style={{ backgroundColor: textColor }}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="start" side="bottom" sideOffset={5}>
            <Tabs defaultValue="solid" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="solid">Solid</TabsTrigger>
                <TabsTrigger value="gradient">Gradient</TabsTrigger>
              </TabsList>
              
              <TabsContent value="solid" className="space-y-4 mt-4">
                <div className="text-sm font-medium">Text Color</div>
                
                {/* Color Spectrum */}
                <div className="space-y-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => {
                      const newColor = e.target.value;
                      setTextColor(newColor);
                      editor.chain().focus().setColor(newColor).run();
                    }}
                    className="w-full h-32 cursor-pointer border rounded"
                  />
                </div>

              {/* RGB Values */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block text-gray-600 mb-1">R</label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={parseInt(textColor.slice(1, 3), 16)}
                    onChange={(e) => {
                      const r = Math.min(255, Math.max(0, parseInt(e.target.value) || 0));
                      const g = parseInt(textColor.slice(3, 5), 16);
                      const b = parseInt(textColor.slice(5, 7), 16);
                      const newColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                      setTextColor(newColor);
                      editor.chain().focus().setColor(newColor).run();
                    }}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">G</label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={parseInt(textColor.slice(3, 5), 16)}
                    onChange={(e) => {
                      const r = parseInt(textColor.slice(1, 3), 16);
                      const g = Math.min(255, Math.max(0, parseInt(e.target.value) || 0));
                      const b = parseInt(textColor.slice(5, 7), 16);
                      const newColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                      setTextColor(newColor);
                      editor.chain().focus().setColor(newColor).run();
                    }}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">B</label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={parseInt(textColor.slice(5, 7), 16)}
                    onChange={(e) => {
                      const r = parseInt(textColor.slice(1, 3), 16);
                      const g = parseInt(textColor.slice(3, 5), 16);
                      const b = Math.min(255, Math.max(0, parseInt(e.target.value) || 0));
                      const newColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                      setTextColor(newColor);
                      editor.chain().focus().setColor(newColor).run();
                    }}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
              </div>

              {/* Hex Input */}
              <div className="space-y-1">
                <label className="block text-xs text-gray-600">Hex</label>
                <input
                  type="text"
                  value={textColor.toUpperCase()}
                  onChange={(e) => {
                    const newColor = e.target.value;
                    if (/^#[0-9A-F]{6}$/i.test(newColor)) {
                      setTextColor(newColor);
                      editor.chain().focus().setColor(newColor).run();
                    }
                  }}
                  className="w-full px-2 py-1 border rounded text-xs font-mono"
                  placeholder="#000000"
                />
              </div>

              {/* Preset Colors */}
              <div className="space-y-2">
                <label className="block text-xs text-gray-600">Preset Colors</label>
                <div className="grid grid-cols-8 gap-1">
                  {['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
                    '#800000', '#008000', '#000080', '#808000', '#800080', '#008080', '#C0C0C0', '#808080',
                    '#FFA500', '#FFC0CB', '#FFD700', '#90EE90', '#87CEEB', '#DDA0DD', '#F0E68C', '#FF6347'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        setTextColor(color);
                        editor.chain().focus().setColor(color).run();
                      }}
                      className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              </TabsContent>

              <TabsContent value="gradient" className="space-y-4 mt-4">
                <div className="text-sm font-medium">Gradient Color</div>
                
                {/* Direction Selector */}
                <div className="space-y-2">
                  <label className="block text-xs text-gray-600">Direction</label>
                  <Select value={gradientDirection} onValueChange={setGradientDirection}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="right">Right →</SelectItem>
                      <SelectItem value="left">Left ←</SelectItem>
                      <SelectItem value="down">Down ↓</SelectItem>
                      <SelectItem value="up">Up ↑</SelectItem>
                      <SelectItem value="diagonal-down">Diagonal ↘</SelectItem>
                      <SelectItem value="diagonal-up">Diagonal ↗</SelectItem>
                      <SelectItem value="radial">Radial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Color 1 */}
                <div className="space-y-2">
                  <label className="block text-xs text-gray-600">Color 1</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={gradientColor1}
                      onChange={(e) => setGradientColor1(e.target.value)}
                      className="w-12 h-8 cursor-pointer border rounded"
                    />
                    <input
                      type="text"
                      value={gradientColor1.toUpperCase()}
                      onChange={(e) => {
                        const newColor = e.target.value;
                        if (/^#[0-9A-F]{6}$/i.test(newColor)) {
                          setGradientColor1(newColor);
                        }
                      }}
                      className="flex-1 px-2 py-1 border rounded text-xs font-mono"
                      placeholder="#FF512F"
                    />
                  </div>
                </div>

                {/* Color 2 */}
                <div className="space-y-2">
                  <label className="block text-xs text-gray-600">Color 2</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={gradientColor2}
                      onChange={(e) => setGradientColor2(e.target.value)}
                      className="w-12 h-8 cursor-pointer border rounded"
                    />
                    <input
                      type="text"
                      value={gradientColor2.toUpperCase()}
                      onChange={(e) => {
                        const newColor = e.target.value;
                        if (/^#[0-9A-F]{6}$/i.test(newColor)) {
                          setGradientColor2(newColor);
                        }
                      }}
                      className="flex-1 px-2 py-1 border rounded text-xs font-mono"
                      placeholder="#DD2476"
                    />
                  </div>
                </div>

                {/* Third Color Option */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="third-color"
                    checked={useThirdColor}
                    onCheckedChange={setUseThirdColor}
                  />
                  <label htmlFor="third-color" className="text-xs text-gray-600 cursor-pointer">
                    Add third color
                  </label>
                </div>

                {useThirdColor && (
                  <div className="space-y-2">
                    <label className="block text-xs text-gray-600">Color 3</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={gradientColor3 || "#000000"}
                        onChange={(e) => setGradientColor3(e.target.value)}
                        className="w-12 h-8 cursor-pointer border rounded"
                      />
                      <input
                        type="text"
                        value={(gradientColor3 || "#000000").toUpperCase()}
                        onChange={(e) => {
                          const newColor = e.target.value;
                          if (/^#[0-9A-F]{6}$/i.test(newColor)) {
                            setGradientColor3(newColor);
                          }
                        }}
                        className="flex-1 px-2 py-1 border rounded text-xs font-mono"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                )}

                {/* Gradient Preview */}
                <div className="space-y-2">
                  <label className="block text-xs text-gray-600">Preview</label>
                  <div
                    className="w-full h-12 rounded border"
                    style={{
                      background: useThirdColor && gradientColor3
                        ? getGradientCSS(gradientDirection, gradientColor1, gradientColor2, gradientColor3)
                        : getGradientCSS(gradientDirection, gradientColor1, gradientColor2)
                    }}
                  />
                </div>

                {/* Apply Gradient Button */}
                <Button
                  type="button"
                  onClick={() => {
                    const gradientCSS = useThirdColor && gradientColor3
                      ? getGradientCSS(gradientDirection, gradientColor1, gradientColor2, gradientColor3)
                      : getGradientCSS(gradientDirection, gradientColor1, gradientColor2);
                    
                    // Apply gradient as background with text clipping
                    editor.chain().focus().setMark("textStyle", {
                      background: gradientCSS,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text"
                    }).run();
                    
                    setTextColorOpen(false);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Apply Gradient
                </Button>
              </TabsContent>
            </Tabs>
          </PopoverContent>
        </Popover>

        {/* Highlight Color - Icon Button with Popover */}
        <Popover open={highlightColorOpen} onOpenChange={setHighlightColorOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 relative group"
              title="Highlight Color"
            >
              <Highlighter className="h-4 w-4" />
              <div 
                className="absolute bottom-0 left-0 right-0 h-1 rounded-b border-t"
                style={{ backgroundColor: highlightColor }}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="start" side="bottom" sideOffset={5}>
            <Tabs defaultValue="solid" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="solid">Solid</TabsTrigger>
                <TabsTrigger value="gradient">Gradient</TabsTrigger>
              </TabsList>
              
              <TabsContent value="solid" className="space-y-4 mt-4">
                <div className="text-sm font-medium">Highlight Color</div>
                
                {/* Color Spectrum */}
                <div className="space-y-2">
                  <input
                    type="color"
                    value={highlightColor}
                    onChange={(e) => {
                      const newColor = e.target.value;
                      setHighlightColor(newColor);
                      editor.chain().focus().toggleHighlight({ color: newColor }).run();
                    }}
                    className="w-full h-32 cursor-pointer border rounded"
                  />
                </div>

              {/* RGB Values */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block text-gray-600 mb-1">R</label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={parseInt(highlightColor.slice(1, 3), 16)}
                    onChange={(e) => {
                      const r = Math.min(255, Math.max(0, parseInt(e.target.value) || 0));
                      const g = parseInt(highlightColor.slice(3, 5), 16);
                      const b = parseInt(highlightColor.slice(5, 7), 16);
                      const newColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                      setHighlightColor(newColor);
                      editor.chain().focus().toggleHighlight({ color: newColor }).run();
                    }}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">G</label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={parseInt(highlightColor.slice(3, 5), 16)}
                    onChange={(e) => {
                      const r = parseInt(highlightColor.slice(1, 3), 16);
                      const g = Math.min(255, Math.max(0, parseInt(e.target.value) || 0));
                      const b = parseInt(highlightColor.slice(5, 7), 16);
                      const newColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                      setHighlightColor(newColor);
                      editor.chain().focus().toggleHighlight({ color: newColor }).run();
                    }}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">B</label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={parseInt(highlightColor.slice(5, 7), 16)}
                    onChange={(e) => {
                      const r = parseInt(highlightColor.slice(1, 3), 16);
                      const g = parseInt(highlightColor.slice(3, 5), 16);
                      const b = Math.min(255, Math.max(0, parseInt(e.target.value) || 0));
                      const newColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                      setHighlightColor(newColor);
                      editor.chain().focus().toggleHighlight({ color: newColor }).run();
                    }}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
              </div>

              {/* Hex Input */}
              <div className="space-y-1">
                <label className="block text-xs text-gray-600">Hex</label>
                <input
                  type="text"
                  value={highlightColor.toUpperCase()}
                  onChange={(e) => {
                    const newColor = e.target.value;
                    if (/^#[0-9A-F]{6}$/i.test(newColor)) {
                      setHighlightColor(newColor);
                      editor.chain().focus().toggleHighlight({ color: newColor }).run();
                    }
                  }}
                  className="w-full px-2 py-1 border rounded text-xs font-mono"
                  placeholder="#ffff00"
                />
              </div>

              {/* Preset Colors */}
              <div className="space-y-2">
                <label className="block text-xs text-gray-600">Preset Colors</label>
                <div className="grid grid-cols-8 gap-1">
                  {['#FFFF00', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#F44336', '#E91E63', '#9C27B0',
                    '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A',
                    '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#F44336', '#E91E63', '#9C27B0'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        setHighlightColor(color);
                        editor.chain().focus().toggleHighlight({ color }).run();
                      }}
                      className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              </TabsContent>

              <TabsContent value="gradient" className="space-y-4 mt-4">
                <div className="text-sm font-medium">Gradient Highlight</div>
                
                {/* Direction Selector */}
                <div className="space-y-2">
                  <label className="block text-xs text-gray-600">Direction</label>
                  <Select value={highlightGradientDirection} onValueChange={setHighlightGradientDirection}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="right">Right →</SelectItem>
                      <SelectItem value="left">Left ←</SelectItem>
                      <SelectItem value="down">Down ↓</SelectItem>
                      <SelectItem value="up">Up ↑</SelectItem>
                      <SelectItem value="diagonal-down">Diagonal ↘</SelectItem>
                      <SelectItem value="diagonal-up">Diagonal ↗</SelectItem>
                      <SelectItem value="radial">Radial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Color 1 */}
                <div className="space-y-2">
                  <label className="block text-xs text-gray-600">Color 1</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={highlightGradientColor1}
                      onChange={(e) => setHighlightGradientColor1(e.target.value)}
                      className="w-12 h-8 cursor-pointer border rounded"
                    />
                    <input
                      type="text"
                      value={highlightGradientColor1.toUpperCase()}
                      onChange={(e) => {
                        const newColor = e.target.value;
                        if (/^#[0-9A-F]{6}$/i.test(newColor)) {
                          setHighlightGradientColor1(newColor);
                        }
                      }}
                      className="flex-1 px-2 py-1 border rounded text-xs font-mono"
                      placeholder="#FFFF00"
                    />
                  </div>
                </div>

                {/* Color 2 */}
                <div className="space-y-2">
                  <label className="block text-xs text-gray-600">Color 2</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={highlightGradientColor2}
                      onChange={(e) => setHighlightGradientColor2(e.target.value)}
                      className="w-12 h-8 cursor-pointer border rounded"
                    />
                    <input
                      type="text"
                      value={highlightGradientColor2.toUpperCase()}
                      onChange={(e) => {
                        const newColor = e.target.value;
                        if (/^#[0-9A-F]{6}$/i.test(newColor)) {
                          setHighlightGradientColor2(newColor);
                        }
                      }}
                      className="flex-1 px-2 py-1 border rounded text-xs font-mono"
                      placeholder="#FFD700"
                    />
                  </div>
                </div>

                {/* Third Color Option */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="highlight-third-color"
                    checked={useHighlightThirdColor}
                    onCheckedChange={setUseHighlightThirdColor}
                  />
                  <label htmlFor="highlight-third-color" className="text-xs text-gray-600 cursor-pointer">
                    Add third color
                  </label>
                </div>

                {useHighlightThirdColor && (
                  <div className="space-y-2">
                    <label className="block text-xs text-gray-600">Color 3</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={highlightGradientColor3 || "#000000"}
                        onChange={(e) => setHighlightGradientColor3(e.target.value)}
                        className="w-12 h-8 cursor-pointer border rounded"
                      />
                      <input
                        type="text"
                        value={(highlightGradientColor3 || "#000000").toUpperCase()}
                        onChange={(e) => {
                          const newColor = e.target.value;
                          if (/^#[0-9A-F]{6}$/i.test(newColor)) {
                            setHighlightGradientColor3(newColor);
                          }
                        }}
                        className="flex-1 px-2 py-1 border rounded text-xs font-mono"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                )}

                {/* Gradient Preview */}
                <div className="space-y-2">
                  <label className="block text-xs text-gray-600">Preview</label>
                  <div
                    className="w-full h-12 rounded border"
                    style={{
                      background: useHighlightThirdColor && highlightGradientColor3
                        ? getGradientCSS(highlightGradientDirection, highlightGradientColor1, highlightGradientColor2, highlightGradientColor3)
                        : getGradientCSS(highlightGradientDirection, highlightGradientColor1, highlightGradientColor2)
                    }}
                  />
                </div>

                {/* Apply Gradient Button */}
                <Button
                  type="button"
                  onClick={() => {
                    const gradientCSS = useHighlightThirdColor && highlightGradientColor3
                      ? getGradientCSS(highlightGradientDirection, highlightGradientColor1, highlightGradientColor2, highlightGradientColor3)
                      : getGradientCSS(highlightGradientDirection, highlightGradientColor1, highlightGradientColor2);
                    
                    // Apply gradient as highlight background
                    editor.chain().focus().toggleHighlight({ 
                      color: gradientCSS 
                    }).run();
                    
                    setHighlightColorOpen(false);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Apply Gradient
                </Button>
              </TabsContent>
            </Tabs>
          </PopoverContent>
        </Popover>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Paragraph Style */}
        <Select
          value={
            editor.isActive("heading", { level: 1 })
              ? "h1"
              : editor.isActive("heading", { level: 2 })
              ? "h2"
              : editor.isActive("heading", { level: 3 })
              ? "h3"
              : editor.isActive("heading", { level: 4 })
              ? "h4"
              : editor.isActive("heading", { level: 5 })
              ? "h5"
              : editor.isActive("heading", { level: 6 })
              ? "h6"
              : "normal"
          }
          onValueChange={(value) => {
            if (value === "normal") {
              editor.chain().focus().setParagraph().run();
            } else {
              const level = parseInt(value.replace("h", ""));
              editor.chain().focus().toggleHeading({ level }).run();
            }
          }}
        >
          <SelectTrigger className="h-8 w-[100px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="h1">Heading 1</SelectItem>
            <SelectItem value="h2">Heading 2</SelectItem>
            <SelectItem value="h3">Heading 3</SelectItem>
            <SelectItem value="h4">Heading 4</SelectItem>
            <SelectItem value="h5">Heading 5</SelectItem>
            <SelectItem value="h6">Heading 6</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Text Alignment */}
        <Button
          type="button"
          variant={editor.isActive({ textAlign: "left" }) ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className="h-8 w-8 p-0"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive({ textAlign: "center" }) ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className="h-8 w-8 p-0"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive({ textAlign: "right" }) ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className="h-8 w-8 p-0"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive({ textAlign: "justify" }) ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className="h-8 w-8 p-0"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Lists - Combined Button with Dropdown */}
        <div className="flex items-center gap-1">
          {/* Bullet List Button with Dropdown */}
          <div className="flex items-center border border-gray-300 rounded bg-white hover:bg-gray-50">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (editor.isActive("bulletList")) {
                  // If already in a bullet list, just toggle it off
                  editor.chain().focus().toggleBulletList().run();
                } else {
                  // Custom handling to split multi-line content into separate list items
                  editor.chain().focus().command(({ tr, state, dispatch }) => {
                    const { from, to } = state.selection;
                    const { schema } = state;
                    const { $from } = state.selection;
                    
                    // Get selected text or current node's text
                    let contentToProcess = "";
                    let startPos = from;
                    let endPos = to;
                    let isInParagraph = false;
                    let paragraphDepth = -1;
                    
                    // Check if we have a selection
                    if (from !== to) {
                      contentToProcess = state.doc.textBetween(from, to, "\n");
                    } else {
                      // No selection, check current paragraph/node
                      for (let depth = $from.depth; depth > 0; depth--) {
                        const node = $from.node(depth);
                        if (node.type.name === 'paragraph') {
                          contentToProcess = node.textContent;
                          startPos = $from.start(depth);
                          endPos = $from.end(depth);
                          paragraphDepth = depth;
                          isInParagraph = true;
                          break;
                        }
                      }
                    }
                    
                    // Check if content has newlines that need to be split
                    if (contentToProcess && contentToProcess.includes("\n")) {
                      const lines = contentToProcess.split(/\r?\n/).filter(line => line.trim().length > 0);
                      
                      if (lines.length > 1) {
                        // Create list items for each line
                        const listItems = lines.map(line => {
                          const paragraph = schema.nodes.paragraph.create({}, schema.text(line.trim()));
                          return schema.nodes.listItem.create({}, paragraph);
                        });
                        
                        // Create a bullet list with all list items
                        const bulletList = schema.nodes.bulletList.create({}, listItems);
                        
                        if (from !== to || isInParagraph) {
                          // Replace selected content or current paragraph
                          tr.replaceWith(startPos, endPos, bulletList);
                        } else {
                          // Insert at current position
                          tr.insert($from.pos, bulletList);
                        }
                        
                        // Set selection to end of the list
                        const listEnd = startPos + bulletList.nodeSize - 1;
                        tr.setSelection(tr.doc.resolve(Math.max(0, listEnd - 1)));
                        
                        if (dispatch) {
                          dispatch(tr);
                        }
                        return true;
                      }
                    }
                    
                    // Check if there are multiple paragraphs in selection that should be converted
                    const paragraphs = [];
                    state.doc.nodesBetween(from, to, (node, pos, parent) => {
                      if (node.type.name === 'paragraph' && node.textContent.trim()) {
                        const parentType = parent ? parent.type.name : 'doc';
                        // Only include paragraphs that are not already in a list
                        if (parentType !== 'listItem') {
                          paragraphs.push({ node, pos });
                        }
                      }
                    });
                    
                    if (paragraphs.length > 1) {
                      // Multiple paragraphs found, convert each to a list item
                      paragraphs.sort((a, b) => a.pos - b.pos);
                      
                      const listItems = paragraphs.map(({ node }) => {
                        return schema.nodes.listItem.create({}, node.content);
                      });
                      
                      const bulletList = schema.nodes.bulletList.create({}, listItems);
                      
                      // Calculate replacement range
                      const firstPos = paragraphs[0].pos;
                      const lastPos = paragraphs[paragraphs.length - 1].pos;
                      const lastNode = paragraphs[paragraphs.length - 1].node;
                      
                      const $first = state.doc.resolve(firstPos);
                      const $last = state.doc.resolve(lastPos + lastNode.nodeSize);
                      
                      const replaceFrom = $first.start($first.depth);
                      const replaceTo = $last.end($last.depth);
                      
                      tr.replaceWith(replaceFrom, replaceTo, bulletList);
                      
                      if (dispatch) {
                        dispatch(tr);
                      }
                      return true;
                    }
                    
                    return false;
                  }).run();
                  
                  // If command didn't handle it, use default toggle
                  setTimeout(() => {
                    if (!editor.isActive("bulletList")) {
                      editor.chain().focus().toggleBulletList().run();
                    }
                  }, 10);
                }
              }}
              className={`h-8 px-2 rounded-r-none border-r border-gray-300 ${editor.isActive("bulletList") ? "bg-blue-50" : ""}`}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={`h-8 px-1 rounded-l-none ${editor.isActive("bulletList") ? "bg-blue-50" : ""}`}
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="start">
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (!editor.isActive("bulletList")) {
                        editor.chain().focus().toggleBulletList().run();
                      }
                      setTimeout(() => applyListStyle("disc"), 50);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                  >
                    <span className="text-lg">●</span> Disc
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!editor.isActive("bulletList")) {
                        editor.chain().focus().toggleBulletList().run();
                      }
                      setTimeout(() => applyListStyle("circle"), 50);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                  >
                    <span className="text-lg">○</span> Circle
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!editor.isActive("bulletList")) {
                        editor.chain().focus().toggleBulletList().run();
                      }
                      setTimeout(() => applyListStyle("square"), 50);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                  >
                    <span className="text-lg">■</span> Square
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!editor.isActive("bulletList")) {
                        editor.chain().focus().toggleBulletList().run();
                      }
                      setTimeout(() => applyListStyle("checkmark"), 50);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                  >
                    <span className="text-lg text-green-600">✓</span> Checkmark
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!editor.isActive("bulletList")) {
                        editor.chain().focus().toggleBulletList().run();
                      }
                      setTimeout(() => applyListStyle("arrow"), 50);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                  >
                    <span className="text-lg text-blue-600">→</span> Arrow
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!editor.isActive("bulletList")) {
                        editor.chain().focus().toggleBulletList().run();
                      }
                      setTimeout(() => applyListStyle("dash"), 50);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                  >
                    <span className="text-lg">—</span> Dash
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!editor.isActive("bulletList")) {
                        editor.chain().focus().toggleBulletList().run();
                      }
                      setTimeout(() => applyListStyle("star"), 50);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                  >
                    <span className="text-lg text-yellow-600">★</span> Star
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!editor.isActive("bulletList")) {
                        editor.chain().focus().toggleBulletList().run();
                      }
                      setTimeout(() => applyListStyle("triangle"), 50);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                  >
                    <span className="text-lg text-purple-600">▶</span> Triangle
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Numbered List Button with Dropdown */}
          <div className="flex items-center border border-gray-300 rounded bg-white hover:bg-gray-50">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (!editor.isActive("orderedList")) {
                  editor.chain().focus().toggleOrderedList().run();
                }
              }}
              className={`h-8 px-2 rounded-r-none border-r border-gray-300 ${editor.isActive("orderedList") ? "bg-blue-50" : ""}`}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={`h-8 px-1 rounded-l-none ${editor.isActive("orderedList") ? "bg-blue-50" : ""}`}
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="start">
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (!editor.isActive("orderedList")) {
                        editor.chain().focus().toggleOrderedList().run();
                      }
                      setTimeout(() => applyOrderedListStyle("decimal"), 50);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                  >
                    <span>1, 2, 3</span> Decimal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!editor.isActive("orderedList")) {
                        editor.chain().focus().toggleOrderedList().run();
                      }
                      setTimeout(() => applyOrderedListStyle("lower-alpha"), 50);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                  >
                    <span>a, b, c</span> Lower Alpha
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!editor.isActive("orderedList")) {
                        editor.chain().focus().toggleOrderedList().run();
                      }
                      setTimeout(() => applyOrderedListStyle("upper-alpha"), 50);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                  >
                    <span>A, B, C</span> Upper Alpha
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!editor.isActive("orderedList")) {
                        editor.chain().focus().toggleOrderedList().run();
                      }
                      setTimeout(() => applyOrderedListStyle("lower-roman"), 50);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                  >
                    <span>i, ii, iii</span> Lower Roman
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!editor.isActive("orderedList")) {
                        editor.chain().focus().toggleOrderedList().run();
                      }
                      setTimeout(() => applyOrderedListStyle("upper-roman"), 50);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                  >
                    <span>I, II, III</span> Upper Roman
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Indentation */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().liftListItem("listItem").run()}
          className="h-8 w-8 p-0"
          title="Decrease Indent"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M7 8l-4 4 4 4M21 12H11" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().sinkListItem("listItem").run()}
          className="h-8 w-8 p-0"
          title="Increase Indent"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M17 8l4 4-4 4M3 12h10" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Insert Options */}
        <Button
          type="button"
          variant={editor.isActive("link") ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            const url = window.prompt("Enter URL:");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className="h-8 w-8 p-0"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = window.prompt("Enter image URL:");
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
          className="h-8 w-8 p-0"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("table") ? "default" : "ghost"}
          size="sm"
          onClick={insertTable}
          className="h-8 w-8 p-0"
        >
          <TableIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <div className="relative bg-white">
        <EditorContent editor={editor} className="min-h-[300px] max-h-[600px] overflow-y-auto custom-scrollbar" />
      </div>
    </div>
  );
};

export default TipTapEditor;

