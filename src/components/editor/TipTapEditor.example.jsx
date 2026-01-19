/**
 * Example usage of TipTapEditor component
 * 
 * Import and use the TipTapEditor component like this:
 */

import TipTapEditor from "@/components/editor/TipTapEditor";
import { useState } from "react";

export default function ExampleUsage() {
  const [content, setContent] = useState("");

  const handleContentChange = (html) => {
    setContent(html);
    console.log("Editor content:", html);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">TipTap Editor Example</h1>
      
      <TipTapEditor
        content={content}
        onChange={handleContentChange}
        placeholder="Start typing..."
        className="max-w-4xl mx-auto"
      />

      {/* You can use the content state to save to your backend */}
      <div className="mt-4">
        <button
          onClick={() => {
            // Save content to your API
            console.log("Saving content:", content);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Save Content
        </button>
      </div>
    </div>
  );
}

/**
 * Props:
 * - content: string (optional) - Initial HTML content
 * - onChange: function (optional) - Callback function that receives the HTML content when it changes
 * - placeholder: string (optional) - Placeholder text, defaults to "Start typing..."
 * - className: string (optional) - Additional CSS classes for the editor container
 */











