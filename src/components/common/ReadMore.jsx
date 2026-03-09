"use client";

import { useState } from "react";

export default function ReadMore({ paragraphs = [] }) {
const [expanded, setExpanded] = useState(false);

const fullText = paragraphs.join(" ");

const limit = 400; // reduced so button appears more often

const isLong = fullText.length > limit;

const displayText = expanded ? fullText : fullText.slice(0, limit);

return ( <div className="text-gray-700 text-lg leading-relaxed space-y-4">


  <p>
    {displayText}
    {!expanded && isLong && "..."}
  </p>

  {isLong && (
    <button
      onClick={() => setExpanded(!expanded)}
      className="text-blue-600 font-semibold hover:underline"
    >
      {expanded ? "Show Less" : "Read More"}
    </button>
  )}

</div>

);
}
